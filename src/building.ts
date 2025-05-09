import { Elevator } from './elevator';
import { Floor } from './floor';

/**
 * Configuration interface for building parameters
 */
export interface BuildingSettings {
    numberOfFloors: number;      // Total number of floors in the building
    numberOfElevators: number;   // Total number of elevators serving the building
    floorHeight: number;         // Height of each floor in pixels
    movementSpeed: number;       // Time in seconds for elevator to move between floors
    stopDelay: number;          // Time in seconds elevator waits at each stop
    floorPassingTime: number;    // Time in seconds to pass each floor during movement
}

/**
 * Default configuration values for the building
 */
export const DefaultSettings: BuildingSettings = {
    numberOfFloors: 10,
    numberOfElevators: 2,
    floorHeight: 100,
    movementSpeed: 1,
    stopDelay: 2,
    floorPassingTime: 0.5
};

/**
 * Represents the building and manages elevator operations
 * Coordinates between floors and elevators to handle transportation requests
 */
export class Building {
    private elevators: Elevator[] = [];           // Collection of all elevators in the building
    private floors: Floor[] = [];                 // Collection of all floors in the building
    private settings: BuildingSettings;           // Building configuration parameters
    onElevatorArrival: ((floor: number) => void) | undefined;    // Callback for elevator arrival events
    onElevatorLeft: ((floor: number) => void) | undefined;       // Callback for elevator departure events

    constructor(settings: BuildingSettings) {
        this.settings = settings;
    }

    /**
     * Adds a new elevator to the building's elevator system
     */
    addElevator(elevator: Elevator) {
        this.elevators.push(elevator);
    }

    /**
     * Adds a new floor to the building
     */
    addFloor(floor: Floor) {
        this.floors.push(floor);
    }

    /**
     * Calculates a score for each elevator to determine the best one to handle a request
     * Lower scores indicate better candidates
     * @param elevator - The elevator to evaluate
     * @param requestedFloor - The floor requesting service
     * @returns Score based on estimated time to service the request
     */
    private calculateElevatorScore(elevator: Elevator, requestedFloor: number): number {
        const remainingTime = elevator.getRemainingTime();
        const additionalTime = elevator.calculateAdditionalTime(requestedFloor);
        const totalTime = remainingTime + (additionalTime * 1000);

        return totalTime;
    }

    /**
     * Processes a request for an elevator from a specific floor
     * Selects the most appropriate elevator based on scoring algorithm
     * @param floorNumber - The floor requesting an elevator
     */
    requestElevator(floorNumber: number) {
        let selectedElevator: Elevator | null = null;
        let bestScore = Infinity;

        // Find the elevator that can service this request most efficiently
        for (const elevator of this.elevators) {
            const score = this.calculateElevatorScore(elevator, floorNumber);
            if (score < bestScore) {
                bestScore = score;
                selectedElevator = elevator;
            }
        }

        if (selectedElevator) {
            this.floors[floorNumber].pressButton();
            selectedElevator.assignFloor(floorNumber);
            selectedElevator.move(
                () => this.handleElevatorArrival(selectedElevator)
            );
        }
    }

    /**
     * Handles elevator arrival events
     * Updates floor status and triggers arrival callbacks
     * @param floor - The floor where the elevator has arrived
     * @param elevator - The elevator that has arrived
     */
    private handleElevatorArrival(elevator: Elevator) {
        console.log(this.elevators);
        console.log(this.floors)
        if (elevator.previousFloor !== null) {
            this.floors[elevator.previousFloor].hasElevator = false;
            if (this.onElevatorLeft) {
                this.onElevatorLeft(elevator.previousFloor);
            }
        }

        this.floors[elevator.currentFloor].hasElevator = true;

        setTimeout(() => {
            console.log('----------')
            console.log('Elevator arrived at floor', elevator.currentFloor);
            this.floors[elevator.currentFloor].resetButton();
            if (this.onElevatorArrival) {
                this.onElevatorArrival(elevator.currentFloor);
            }
        }, this.settings.stopDelay * 1000);
    }

    /**
     * Gets the current building configuration
     */
    getSettings(): BuildingSettings {
        return this.settings;
    }

    /**
     * Gets all elevators in the building
     */
    getElevators(): Elevator[] {
        return this.elevators;
    }

    /**
     * Gets all floors in the building
     */
    getFloors(): Floor[] {
        return this.floors;
    }
}