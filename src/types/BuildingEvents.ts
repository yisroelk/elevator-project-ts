import { Elevator } from '../core/elevator.js';
import { Floor } from '../core/floor.js';

export enum BuildingEvents {
    ELEVATOR_REQUESTED = 'elevatorRequested',
    ELEVATOR_ARRIVED = 'elevatorArrived',
    ELEVATOR_LEFT = 'elevatorLeft',
    FLOOR_UPDATED = 'floorUpdated',
    COUNTDOWN_CHANGED = 'countdownChanged',
    ELEVATOR_POSITION_CHANGED = 'elevatorPositionChanged',
    END_FLOOR_STOP = 'endFloorStop'
}

export interface BuildingEventMap {
    [BuildingEvents.ELEVATOR_REQUESTED]: {
        floor: number;
        elevator: Elevator;
        estimatedTime: number;
    };
    [BuildingEvents.ELEVATOR_ARRIVED]: {
        floor: number;
        elevator: Elevator;
    };
    [BuildingEvents.ELEVATOR_LEFT]: {
        floor: number;
        elevator: Elevator;
    };
    [BuildingEvents.FLOOR_UPDATED]: Floor;
    [BuildingEvents.END_FLOOR_STOP]: { floor: number };
    [BuildingEvents.COUNTDOWN_CHANGED]: {
        floor: number;
        timeLeft: number;
    };
    [BuildingEvents.ELEVATOR_POSITION_CHANGED]: {
        elevator: number;
        position: number;
    };
}