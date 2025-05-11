import { ElevatorSettings } from '../types/ElevatorSettings.js';
import { DomUtils } from '../utils/DomUtils.js';
import { EventEmitter } from '../utils/EventEmitter.js';
import { ELEVATOR_SETTINGS } from '../constants/settings.js';

/**
 * Represents an elevator in the building
 * Handles movement, scheduling, and time estimation for elevator operations
 */
export class Elevator extends EventEmitter {
    id: number;                                    // Unique identifier for the elevator
    currentFloor: number = 0;                      // Current floor position
    targetFloors: number[] = [];                   // Queue of floors to visit
    isMoving: boolean = false;                     // Current movement state
    lastIntendedFloor: number = 0;                // Last floor in current schedule
    element: HTMLElement;                          // DOM element representing the elevator
    settings: ElevatorSettings;                    // Configuration settings
    estimatedCompletionTime: number = 0;          // Estimated time to complete all scheduled stops
    currentDestination: number | null = null;
    previousFloor: number | null = null; // Previous floor

    constructor(id: number, element: HTMLElement, settings: ElevatorSettings = ELEVATOR_SETTINGS) {
        super();
        this.id = id;
        this.element = element;
        this.settings = settings;
    }

    /**
     * Calculates additional time needed to service a new floor request
     * @param newFloor - The floor number being requested
     * @returns Time in seconds needed to service the new floor
     */
    calculateAdditionalTime(newFloor: number): number {
        if (this.targetFloors.length === 0) {
            // If this is the first floor being added, calculate from current position
            const floorsToMove = Math.abs(newFloor - this.currentFloor);
            return floorsToMove * this.settings.floorPassingTime + this.settings.stopDelay;
        } else {
            // Calculate from the last floor in the current sequence
            const previousLastFloor = this.lastIntendedFloor;
            const floorsToMove = Math.abs(newFloor - previousLastFloor);
            return floorsToMove * this.settings.floorPassingTime + this.settings.stopDelay;
        }
    }

    /**
     * Assigns a new floor request to this elevator
     * @param floor - The floor number to add to the schedule
     */
    assignFloor(floor: number) {
        if (!this.targetFloors.includes(floor)) {
            const additionalTime = this.calculateAdditionalTime(floor);

            // Update completion time estimates
            if (this.estimatedCompletionTime === 0) {
                this.estimatedCompletionTime = Date.now() + (additionalTime * 1000);
            } else {
                this.estimatedCompletionTime += (additionalTime * 1000);
            }

            this.targetFloors.push(floor);
            this.lastIntendedFloor = floor;
        }
    }

    /**
     * Checks if a given floor is the current destination floor
     * @param floor - The floor number to check
     * @returns True if this is the destination floor
     */
    isDestinationFloor(floor: number): boolean {
        return this.currentDestination === floor;
    }

    /**
     * Gets the remaining time for the elevator to complete its current schedule
     * @returns Time in milliseconds until all current requests are completed
     */
    getRemainingTime(): number {
        if (this.estimatedCompletionTime === 0) return 0;
        const remainingTime = this.estimatedCompletionTime - Date.now();
        return Math.max(0, remainingTime);
    }

    /**
     * Initiates elevator movement to the next target floor
     * Emits 'arrival' event when elevator arrives at destination
     */
    move() {
        console.log('targetFloors', this.targetFloors);
        if (this.isMoving || this.targetFloors.length === 0) return;

        this.isMoving = true;
        const nextFloor = this.targetFloors.shift();
        if (nextFloor === undefined || nextFloor === this.currentFloor) {
            if (this.targetFloors.length === 0) {
                this.estimatedCompletionTime = 0;
            }
            this.currentDestination = null;
            this.emit('arrival', this);
            return;
        }

        this.currentDestination = nextFloor;
        this.previousFloor = this.currentFloor;

        // Calculate total movement time based on distance
        const distance = Math.abs(nextFloor - this.currentFloor);
        const movementTime = distance * this.settings.floorPassingTime;


        // Calculate position from bottom to top (invert the floor number since we want bottom-up)
        const floorPosition = nextFloor * this.settings.floorHeight;

        // Update position with corrected calculation
        this.element.style.transition = `transform ${movementTime}s linear`;
        this.element.style.transform = `translateY(-${floorPosition}px)`;
        this.currentFloor = nextFloor;

        this.emit('move', this);  // Changed from 'moving' to 'move'

        // Handle arrival at destination
        setTimeout(() => {
            this.emit('arrival', this);

            setTimeout(() => {
                this.isMoving = false;

                // If there are more floors in queue, continue to the next one
                if (this.targetFloors.length > 0) {
                    this.move();
                } else {
                    this.estimatedCompletionTime = 0;
                    this.currentDestination = null;
                }
            }, this.settings.stopDelay * 1000);
        }, movementTime * 1000);
    }
}