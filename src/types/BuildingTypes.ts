import { Elevator } from '../core/elevator';
import { Floor } from '../core/floor';
import { BuildingEvents } from './BuildingEvents';

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