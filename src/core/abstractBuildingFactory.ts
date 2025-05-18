import { Building } from './building';
import { Elevator } from './elevator';
import { Floor } from './floor';
import { SettingsManager } from './SettingsManager';
import { BuildingSettings, ElevatorConfig } from '../types/BuildingSettings';

/**
 * Abstract interface for creating building components
 */
export interface IBuildingFactory {
    createBuilding(settings: BuildingSettings): Building;
    createElevator(id: number, settings: BuildingSettings, elevatorConfig?: ElevatorConfig): Elevator;
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
    abstract createElevator(id: number, settings: BuildingSettings, elevatorConfig?: ElevatorConfig): Elevator;
    abstract createFloor(number: number): Floor;

    /**
     * Creates multiple buildings based on settings
     * @returns An array of Building instances
     */
    createBuildings(): Building[] {
        const settings = this.settingsManager.getSettings();
        return Array.from({ length: settings.numberOfBuildings }, (_, i) => {
            const buildingConfig = settings.buildingConfigs?.[i];
            if (buildingConfig) {
                // Create building with merged settings
                const mergedSettings = {
                    ...settings,
                    defaultBuildingConfig: {
                        ...settings.defaultBuildingConfig,
                        numberOfFloors: buildingConfig.numberOfFloors,
                        numberOfElevators: buildingConfig.numberOfElevators,
                        floorHeight: buildingConfig.floorHeight,
                        factoryType: buildingConfig.factoryType
                    }
                };
                return this.initializeBuilding(i, this, mergedSettings, buildingConfig.elevatorConfigs);
            }
            return this.initializeBuilding(i, this, settings);
        });
    }

    /**
     * Creates a fully configured building with elevators and floors
     * @param buildingIndex - The index of the building being created
     * @param factory - The factory to use for creating components
     * @param settings - The settings to use for this building
     * @param elevatorConfigs - Optional configurations for each elevator
     * @returns A new Building instance ready for operation
     */
    protected initializeBuilding(
        buildingIndex: number,
        factory: IBuildingFactory,
        settings: BuildingSettings,
        elevatorConfigs?: ElevatorConfig[]
    ): Building {
        const building = factory.createBuilding(settings);

        // Create elevators with their specific configs if available
        Array.from({ length: settings.defaultBuildingConfig.numberOfElevators }, (_, i) => {
            const elevatorConfig = elevatorConfigs?.[i] ? {
                ...settings.defaultElevatorConfig,
                ...elevatorConfigs[i]
            } : settings.defaultElevatorConfig;

            const elevator = factory.createElevator(i, settings, elevatorConfig);
            building.addElevator(elevator);
        });

        // Create floors
        Array.from({ length: settings.defaultBuildingConfig.numberOfFloors }, (_, i) => {
            const floor = factory.createFloor(i);
            if (i === 0) {  // Place elevators on ground floor (floor 0)
                // Set initial state for ground floor without playing sound
                Array(settings.defaultBuildingConfig.numberOfElevators).fill(null).forEach(() => {
                    floor.initializeWithElevator();
                });
            }
            building.addFloor(floor);
        });

        return building;
    }
}