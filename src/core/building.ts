import { Elevator } from './elevator.js';
import { Floor } from './floor.js';
import { BuildingSettings } from '../types/BuildingSettings.js';
import { EventEmitter } from '../utils/EventEmitter.js';
import { BuildingEvents } from '../types/BuildingEvents.js';

/**
 * Represents the building and manages elevator operations
 * Coordinates between floors and elevators to handle transportation requests
 */
export class Building extends EventEmitter {
    private elevators: Elevator[] = [];           // Collection of all elevators in the building
    private floors: Floor[] = [];                 // Collection of all floors in the building
    private settings: BuildingSettings;           // Building configuration parameters

    constructor(settings: BuildingSettings) {
        super();
        this.settings = settings;
    }

    /**
     * Adds a new elevator to the building's elevator system
     */
    addElevator(elevator: Elevator) {
        this.elevators.push(elevator);
        elevator.on('arrival', () => this.handleElevatorArrival(elevator));
        elevator.on('move', () => this.handleElevatorMove(elevator));
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
        return remainingTime + (additionalTime * 1000);
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
            // Emit event before making changes
            this.emit(BuildingEvents.ELEVATOR_REQUESTED, {
                floor: floorNumber,
                elevator: selectedElevator,
                estimatedTime: bestScore
            });

            selectedElevator.assignFloor(floorNumber);
            selectedElevator.move();
        }
    }

    /**
     * Handles elevator movement events
     * Updates floor status and triggers movement callbacks
     * @param elevator - The elevator that is moving
     */
    private handleElevatorMove(elevator: Elevator) {
        if (elevator.previousFloor !== null) {
            const previousFloor = this.floors[elevator.previousFloor];
            previousFloor.elevatorLeft();

            this.emit(BuildingEvents.ELEVATOR_LEFT, {
                floor: elevator.previousFloor,
                elevator: elevator
            });

            this.emit(BuildingEvents.FLOOR_UPDATED, previousFloor);
        }
    }

    /**
     * Handles elevator arrival events
     * Updates floor status and triggers arrival callbacks
     * @param floor - The floor where the elevator has arrived
     * @param elevator - The elevator that has arrived
     */
    private handleElevatorArrival(elevator: Elevator) {
        const currentFloor = this.floors[elevator.currentFloor];
        currentFloor.hasElevator = true;

        this.emit(BuildingEvents.ELEVATOR_ARRIVED, {
            floor: elevator.currentFloor,
            elevator: elevator
        });

        this.emit(BuildingEvents.FLOOR_UPDATED, currentFloor);

        setTimeout(() => {
            currentFloor.resetButton();
            this.emit(BuildingEvents.FLOOR_UPDATED, currentFloor);
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