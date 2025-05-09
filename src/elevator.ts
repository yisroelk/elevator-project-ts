import { Floor } from './floor';

/**
 * Interface defining settings for elevator behavior and movement
 */
export interface ElevatorSettings {
    floorHeight: number;  // Height of each floor in pixels
    movementSpeed: number;  // Time to move between floors in seconds
    stopDelay: number;  // Time to wait at each floor in seconds
    floorPassingTime: number;  // Time to pass each floor in seconds
}

/**
 * Default settings for elevator behavior
 */
export const Settings: ElevatorSettings = {
    floorHeight: 100,
    movementSpeed: 1,
    stopDelay: 2,
    floorPassingTime: 0.5
};

/**
 * Represents an elevator in the building
 * Handles movement, scheduling, and time estimation for elevator operations
 */
export class Elevator {
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

    constructor(id: number, element: HTMLElement, settings: ElevatorSettings = Settings) {
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
     * @param arrivalCallback - Called when elevator arrives at destination, receiving the elevator instance
     */
    move(arrivalCallback: (elevator: Elevator) => void) {
        console.log('targetFloors', this.targetFloors);
        if (this.isMoving || this.targetFloors.length === 0) return;

        this.isMoving = true;
        const nextFloor = this.targetFloors.shift();
        if (nextFloor === undefined || nextFloor === this.currentFloor) {
            if (this.targetFloors.length === 0) {
                this.estimatedCompletionTime = 0;
            }
            this.currentDestination = null;
            arrivalCallback(this);
            return;
        }

        this.currentDestination = nextFloor;
        this.previousFloor = this.currentFloor;

        // Calculate total movement time based on distance
        const distance = Math.abs(nextFloor - this.currentFloor);
        const movementTime = distance * this.settings.floorPassingTime;

        // Update position
        this.element.style.transition = `transform ${movementTime}s linear`;
        this.element.style.transform = `translateY(-${nextFloor * this.settings.floorHeight}px)`;
        this.currentFloor = nextFloor;

        // Handle arrival at destination
        setTimeout(() => {
            arrivalCallback(this);

            setTimeout(() => {
                this.isMoving = false;

                // If there are more floors in queue, continue to the next one
                if (this.targetFloors.length > 0) {
                    this.move(arrivalCallback);
                } else {
                    this.estimatedCompletionTime = 0;
                    this.currentDestination = null;
                }
            }, this.settings.stopDelay * 1000);
        }, movementTime * 1000);
    }
}