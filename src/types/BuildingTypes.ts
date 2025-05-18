import { Elevator } from '../core/elevator';
import { Floor } from '../core/floor';
import { BuildingEvents } from './BuildingEvents';

/**
 * Defines the payload types for all building-related events
 */
export interface BuildingEventMap {
    // Event fired when an elevator is requested from a floor
    [BuildingEvents.ELEVATOR_REQUESTED]: {
        floor: number;          // The floor number that requested the elevator
        elevator: Elevator;     // The elevator assigned to handle the request
        estimatedTime: number;  // Estimated arrival time in milliseconds
    };

    // Event fired when an elevator arrives at its destination
    [BuildingEvents.ELEVATOR_ARRIVED]: {
        floor: number;          // The floor the elevator arrived at
        elevator: Elevator;     // The elevator that arrived
    };

    // Event fired when an elevator leaves a floor
    [BuildingEvents.ELEVATOR_LEFT]: {
        floor: number;          // The floor the elevator left from
        elevator: Elevator;     // The elevator that departed
    };

    // Event fired when a floor's state changes
    [BuildingEvents.FLOOR_UPDATED]: Floor;

    // Event fired when an elevator completes its stop at a floor
    [BuildingEvents.END_FLOOR_STOP]: {
        floor: number;          // The floor where the stop was completed
    };

    // Event fired when a floor's countdown timer changes
    [BuildingEvents.COUNTDOWN_CHANGED]: {
        floor: number;          // The floor whose countdown changed
        timeLeft: number;       // Time remaining in seconds
    };

    // Event fired when an elevator's position changes during movement
    [BuildingEvents.ELEVATOR_POSITION_CHANGED]: {
        elevator: number;       // The elevator's ID
        position: number;       // Current position (can be fractional between floors)
    };
}