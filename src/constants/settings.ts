import { BuildingSettings } from '../types/BuildingSettings.js';
import { ElevatorSettings } from '../types/ElevatorSettings.js';

export const ELEVATOR_SETTINGS: ElevatorSettings = {
    floorHeight: 100,
    movementSpeed: 1,
    stopDelay: 2,
    floorPassingTime: 0.5
};

export const CSS_CLASSES = {
    CONTAINER: 'container',
    BUILDING: 'building',
    FLOOR: 'floor',
    ELEVATOR: 'elevator',
    BUTTON: 'floor-button',
    PRESSED: 'pressed',
    SETTINGS_PANEL: 'settings-panel',
    VISIBLE: 'visible'
};