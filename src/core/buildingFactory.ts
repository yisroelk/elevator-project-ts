import { Building } from './building.js';
import { Elevator } from './elevator.js';
import { Floor } from './floor.js';
import { BuildingSettings } from '../types/BuildingSettings.js';
import { SettingsManager } from './SettingsManager.js';
import { DomUtils } from '../utils/DomUtils.js';
import { ELEVATOR_SETTINGS } from '../constants/settings.js';

/**
 * Factory class responsible for creating and configuring building instances
 * Handles initialization of elevators and floors with proper settings
 */
export class BuildingFactory {
    private settingsManager: SettingsManager;

    /**
     * Creates a new BuildingFactory instance
     */
    constructor() {
        this.settingsManager = SettingsManager.getInstance();
    }

    /**
     * Creates multiple buildings based on settings
     * @returns An array of Building instances
     */
    createBuildings(): Building[] {
        const settings = this.settingsManager.getSettings();
        return Array.from({ length: settings.numberOfBuildings }, (_, i) => this.createBuilding(i));
    }

    /**
     * Creates a fully configured building with elevators and floors
     * @param buildingIndex - The index of the building being created
     * @returns A new Building instance ready for operation
     */
    private createBuilding(buildingIndex: number): Building {
        const settings = this.settingsManager.getSettings();
        const building = new Building(settings);

        // Create elevators
        Array.from({ length: settings.numberOfElevators }, (_, i) => {
            const elevatorElement = DomUtils.createElement('div', 'elevator');
            const elevator = new Elevator(i, elevatorElement, ELEVATOR_SETTINGS);
            building.addElevator(elevator);
        });

        // Create floors
        Array.from({ length: settings.numberOfFloors }, (_, i) => {
            const floor = new Floor(i);
            if (i === 0) {  // Place elevators on ground floor (floor 0)
                // Set initial state for ground floor
                Array(settings.numberOfElevators).fill(null).forEach(() => {
                    floor.hasElevator = true;
                });
            }
            building.addFloor(floor);
        });

        return building;
    }
}