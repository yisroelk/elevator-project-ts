import { Building, BuildingSettings, DefaultSettings } from './building.js';
import { Elevator } from './elevator.js';
import { Floor } from './floor.js';

/**
 * Factory class responsible for creating and configuring building instances
 * Handles initialization of elevators and floors with proper settings
 */
export class BuildingFactory {
    private settings: BuildingSettings;

    /**
     * Creates a new BuildingFactory instance
     * @param settings - Optional partial settings to override defaults
     */
    constructor(settings: Partial<BuildingSettings> = {}) {
        this.settings = { ...DefaultSettings, ...settings };
    }

    /**
     * Creates a fully configured building with elevators and floors
     * @returns A new Building instance ready for operation
     */
    createBuilding(): Building {
        const building = new Building(this.settings);

        // Create elevators with DOM elements and add them to building
        for (let i = 0; i < this.settings.numberOfElevators; i++) {
            const elevatorElement = document.createElement('div');
            elevatorElement.className = 'elevator';
            const elevator = new Elevator(i, elevatorElement, this.settings);
            building.addElevator(elevator);
        }

        // Create and initialize all floors
        for (let i = 0; i < this.settings.numberOfFloors; i++) {
            building.addFloor(new Floor(i));
        }

        return building;
    }
}