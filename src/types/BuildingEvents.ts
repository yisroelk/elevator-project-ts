import { Elevator } from '../core/elevator.js';
import { Floor } from '../core/floor.js';

/**
 * Enumeration of all possible events in the elevator system
 * Used as type-safe event names throughout the application
 */
export enum BuildingEvents {
    ELEVATOR_REQUESTED = 'elevatorRequested',     // Fired when a floor calls for an elevator
    ELEVATOR_ARRIVED = 'elevatorArrived',         // Fired when elevator reaches destination
    ELEVATOR_LEFT = 'elevatorLeft',               // Fired when elevator departs from a floor
    FLOOR_UPDATED = 'floorUpdated',              // Fired when floor state changes (button press, elevator presence)
    COUNTDOWN_CHANGED = 'countdownChanged',       // Fired when arrival countdown timer updates
    ELEVATOR_POSITION_CHANGED = 'elevatorPositionChanged',  // Fired during elevator movement
    END_FLOOR_STOP = 'endFloorStop'              // Fired when elevator completes its stop at a floor
}

/**
 * Defines the type structure for each event's payload data
 * This interface ensures type safety when emitting and handling events
 */
export interface BuildingEventMap {
    [BuildingEvents.ELEVATOR_REQUESTED]: {
        floor: number;          // Floor number requesting service
        elevator: Elevator;     // Assigned elevator
        estimatedTime: number;  // Expected arrival time in ms
    };

    [BuildingEvents.ELEVATOR_ARRIVED]: {
        floor: number;          // Floor where elevator arrived
        elevator: Elevator;     // Arriving elevator
    };

    [BuildingEvents.ELEVATOR_LEFT]: {
        floor: number;          // Floor elevator is leaving
        elevator: Elevator;     // Departing elevator
    };

    [BuildingEvents.FLOOR_UPDATED]: Floor;  // Updated floor instance

    [BuildingEvents.END_FLOOR_STOP]: {
        floor: number;          // Floor where stop completed
    };

    [BuildingEvents.COUNTDOWN_CHANGED]: {
        floor: number;          // Floor whose countdown changed
        timeLeft: number;       // Remaining time in seconds
    };

    [BuildingEvents.ELEVATOR_POSITION_CHANGED]: {
        elevator: number;       // Elevator ID
        position: number;       // Current position (can be between floors)
    };
}