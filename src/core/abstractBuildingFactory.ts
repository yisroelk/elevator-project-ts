import { Building } from './building';
import { Elevator } from './elevator';
import { Floor } from './floor';
import { SettingsManager } from './SettingsManager';
import { BuildingSettings } from '../types/BuildingSettings';

/**
 * Abstract interface for creating building components
 */
export interface IBuildingFactory {
    createBuilding(settings: BuildingSettings): Building;
    createElevator(id: number, settings: BuildingSettings): Elevator;
    createFloor(number: number): Floor;
}

/**
 * Abstract base class for building factories
 */
export abstract class BuildingFactoryBase implements IBuildingFactory {
    protected settingsManager: SettingsManager;

    constructor() {
        this.settingsManager = SettingsManager.getInstance();
    }

    abstract createBuilding(settings: BuildingSettings): Building;
    abstract createElevator(id: number, settings: BuildingSettings): Elevator;
    abstract createFloor(number: number): Floor;

    /**
     * Creates multiple buildings based on settings
     * @returns An array of Building instances
     */
    createBuildings(): Building[] {
        const settings = this.settingsManager.getSettings();
        return Array.from({ length: settings.numberOfBuildings }, (_, i) => this.initializeBuilding(i));
    }

    /**
     * Creates a fully configured building with elevators and floors
     * @param buildingIndex - The index of the building being created
     * @returns A new Building instance ready for operation
     */
    protected initializeBuilding(buildingIndex: number): Building {
        const settings = this.settingsManager.getSettings();
        const building = this.createBuilding(settings);

        // Create elevators
        Array.from({ length: settings.numberOfElevators }, (_, i) => {
            const elevator = this.createElevator(i, settings);
            building.addElevator(elevator);
        });

        // Create floors
        Array.from({ length: settings.numberOfFloors }, (_, i) => {
            const floor = this.createFloor(i);
            if (i === 0) {  // Place elevators on ground floor (floor 0)
                // Set initial state for ground floor without playing sound
                Array(settings.numberOfElevators).fill(null).forEach(() => {
                    floor.initializeWithElevator();
                });
            }
            building.addFloor(floor);
        });

        return building;
    }
}