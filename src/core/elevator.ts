import { BuildingSettings } from '../types/BuildingSettings';
import { EventEmitter } from '../utils/EventEmitter';
import { BuildingEvents } from '../types/BuildingEvents';
import { BuildingEventMap } from '../types/BuildingTypes';

/**
 * Represents an elevator in the building
 * Handles movement, scheduling, and time estimation for elevator operations
 */
interface ElevatorEventMap {
    'arrival': Elevator;
    'move': Elevator;
    [BuildingEvents.ELEVATOR_REQUESTED]: BuildingEventMap[BuildingEvents.ELEVATOR_REQUESTED];
    [BuildingEvents.FLOOR_UPDATED]: { type: 'resetButton', floor: number };
}

enum ElevatorState {
    IDLE = 'idle',
    MOVING = 'moving',
    STOPPING = 'stopping'
}

export class Elevator extends EventEmitter<ElevatorEventMap> {
    id: number;                                    // Unique identifier for the elevator
    currentFloor: number = 0;                      // Current floor position
    private targetFloors: number[] = [];                   // Queue of floors to visit
    private state: ElevatorState = ElevatorState.IDLE;         // Current state of the elevator
    private lastIntendedFloor: number = 0;                // Last floor in current schedule
    element: HTMLElement;                          // DOM element representing the elevator
    private settings: BuildingSettings;                    // Configuration settings
    private estimatedCompletionTime: number = 0;          // Estimated time to complete all scheduled stops
    currentDestination: number | null = null;
    previousFloor: number | null = null; // Previous floor

    private timeouts: number[] = [];
    private transitionEndListener: (() => void) | null = null;


    constructor(id: number, element: HTMLElement, settings: BuildingSettings) {
        super();
        this.id = id;
        this.element = element;
        this.settings = settings;
    }

    /**
 * Gets the remaining time for the elevator to complete its current schedule
 * @returns Time in milliseconds until all current requests are completed
 */
    getRemainingTime(): number {
        if (this.estimatedCompletionTime === 0) return 0;
        const remainingTime = this.estimatedCompletionTime - Date.now();
        console.log('Remaining time:', remainingTime);
        return Math.max(0, remainingTime);
    }

    /**
     * Calculates additional time needed to service a new floor request
     * @param newFloor - The floor number being requested
     * @returns Time in milliseconds needed to service the new floor
     */
    getTimeToNewFloor(newFloor: number): number {
        if (this.targetFloors.length === 0) {
            // If this is the first floor being added, calculate from current position
            const floorsToMove = Math.abs(newFloor - this.currentFloor);
            return (floorsToMove * this.settings.floorPassingTime + this.settings.stopDelay) * 1000; // Convert to milliseconds
        } else {
            // Calculate from the last floor in the current sequence
            const previousLastFloor = this.lastIntendedFloor;
            const floorsToMove = Math.abs(newFloor - previousLastFloor);
            return (floorsToMove * this.settings.floorPassingTime + this.settings.stopDelay) * 1000; // Convert to milliseconds
        }
    }

    /**
     * Calculates the total time needed to service a new floor request
     * @param newFloor - The floor number being requested
     * @returns Time in milliseconds needed to service the new floor
     */
    calculateAdditionalTime(newFloor: number): number {
        return this.getRemainingTime() + this.getTimeToNewFloor(newFloor);
    }

    /**
     * Assigns a new floor request to this elevator
     * @param floor - The floor number to add to the schedule
     */
    assignFloor(floor: number) {
        if (!this.targetFloors.includes(floor)) {
            const additionalTime = this.getTimeToNewFloor(floor);

            // Update completion time estimates
            if (this.estimatedCompletionTime === 0) {
                this.estimatedCompletionTime = Date.now() + (additionalTime);
            } else {
                this.estimatedCompletionTime += (additionalTime);
            }

            this.targetFloors.push(floor);
            this.lastIntendedFloor = floor;
            this.move();
        }
    }

    /**
     * Cleans up resources used by this elevator
     */
    dispose(): void {
        // Clear any pending timeouts
        this.timeouts.forEach(timeout => window.clearTimeout(timeout));
        this.timeouts = [];

        // Remove transition end listener if it exists
        if (this.transitionEndListener) {
            this.element.removeEventListener('transitionend', this.transitionEndListener);
            this.transitionEndListener = null;
        }

        // Remove the element from DOM if it exists
        this.element.remove();
    }

    /**
     * Initiates elevator movement to the next target floor
     * Emits 'arrival' event when elevator arrives at destination
     */
    move() {
        if (this.state === ElevatorState.MOVING || this.state === ElevatorState.STOPPING || this.targetFloors.length === 0) return;

        this.state = ElevatorState.MOVING;
        const nextFloor = this.targetFloors.shift();

        if (nextFloor === undefined || nextFloor === this.currentFloor) {
            if (this.targetFloors.length === 0) {
                this.estimatedCompletionTime = 0;
            }
            this.currentDestination = null;
            this.state = ElevatorState.IDLE;
            this.emit('arrival', this);
            return;
        }

        this.currentDestination = nextFloor;
        this.previousFloor = this.currentFloor;
        const distance = Math.abs(nextFloor - this.currentFloor);
        const movementTime = distance * this.settings.floorPassingTime;
        const floorPosition = nextFloor * this.settings.floorHeight;

        // Clean up old transition end listener
        if (this.transitionEndListener) {
            this.element.removeEventListener('transitionend', this.transitionEndListener);
        }

        // Set up new transition end listener
        this.transitionEndListener = () => {
            this.state = ElevatorState.STOPPING;
            this.currentFloor = this.currentDestination!;
            this.emit('arrival', this);

            const stopTimeout = window.setTimeout(() => {
                if (this.state === ElevatorState.STOPPING) {
                    // Reset floor button and emit floor update before changing state
                    this.emit(BuildingEvents.FLOOR_UPDATED, {
                        type: 'resetButton',
                        floor: this.currentFloor
                    });

                    this.state = ElevatorState.IDLE;
                    if (this.targetFloors.length > 0) {
                        this.move();
                    } else {
                        this.estimatedCompletionTime = 0;
                        this.currentDestination = null;
                    }
                }
            }, this.settings.stopDelay * 1000); // Convert to milliseconds

            this.timeouts.push(stopTimeout);
        };

        this.element.addEventListener('transitionend', this.transitionEndListener);

        this.element.style.transition = `transform ${movementTime}s linear`;
        this.element.style.transform = `translateY(-${floorPosition}px)`;
        this.currentFloor = nextFloor;
        this.emit('move', this);

    }
}