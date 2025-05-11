import { Building, BuildingSettings } from './building.js';
import { Elevator } from './elevator.js';
import { Floor } from './floor.js';
import { SettingsManager } from './settings.js';

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
        const buildings: Building[] = [];

        for (let i = 0; i < settings.numberOfBuildings; i++) {
            buildings.push(this.createBuilding(i));
        }

        return buildings;
    }

    /**
     * Creates a fully configured building with elevators and floors
     * @param buildingIndex - The index of the building being created
     * @returns A new Building instance ready for operation
     */
    private createBuilding(buildingIndex: number): Building {
        const settings = this.settingsManager.getSettings();
        const building = new Building(settings);

        // Create elevators with DOM elements and add them to building
        for (let i = 0; i < settings.numberOfElevators; i++) {
            const elevatorElement = document.createElement('div');
            elevatorElement.className = 'elevator';
            const elevator = new Elevator(i, elevatorElement, settings);
            building.addElevator(elevator);
        }

        // Create and initialize all floors
        for (let i = 0; i < settings.numberOfFloors; i++) {
            const floor = new Floor(i);

            // Set initial state for ground floor (floor 0)
            if (i === 0) {
                // Call hasElevator setter multiple times to set the correct count
                for (let j = 0; j < settings.numberOfElevators; j++) {
                    floor.hasElevator = true;
                }
            }

            building.addFloor(floor);
        }

        return building;
    }
}