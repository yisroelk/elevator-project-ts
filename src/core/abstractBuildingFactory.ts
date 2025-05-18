import { Building } from './building';
import { Elevator } from './elevator';
import { Floor } from './floor';
import { SettingsManager } from './SettingsManager';
import { BuildingSettings, ElevatorConfig } from '../types/BuildingSettings';

/**
 * Abstract interface defining the contract for creating building components
 * Follows the Abstract Factory pattern to create families of related objects
 */
export interface IBuildingFactory {
    createBuilding(settings: BuildingSettings): Building;
    createElevator(id: number, settings: BuildingSettings, elevatorConfig?: ElevatorConfig): Elevator;
    createFloor(number: number): Floor;
}

/**
 * Abstract base class implementing common factory functionality
 * Provides template methods for building creation while allowing specific implementations
 * to customize the component creation process
 */
export abstract class BuildingFactoryBase implements IBuildingFactory {
    // Reference to global settings manager
    protected settingsManager: SettingsManager;

    constructor() {
        this.settingsManager = SettingsManager.getInstance();
    }

    // Abstract methods to be implemented by concrete factories
    abstract createBuilding(settings: BuildingSettings): Building;
    abstract createElevator(id: number, settings: BuildingSettings, elevatorConfig?: ElevatorConfig): Elevator;
    abstract createFloor(number: number): Floor;

    /**
     * Template method that creates multiple buildings based on settings
     * Handles the common building creation logic while delegating specific
     * component creation to concrete factory implementations
     */
    createBuildings(): Building[] {
        const settings = this.settingsManager.getSettings();
        return Array.from({ length: settings.numberOfBuildings }, (_, i) => {
            const buildingConfig = settings.buildingConfigs?.[i];
            if (buildingConfig) {
                // Create building with merged settings (override defaults)
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
     * Helper method to fully configure a building with all its components
     * Creates and assembles elevators and floors according to settings
     * 
     * @param buildingIndex - Index of the building being created
     * @param factory - The concrete factory instance to use
     * @param settings - Configuration settings for this building
     * @param elevatorConfigs - Optional specific configurations for elevators
     */
    protected initializeBuilding(
        buildingIndex: number,
        factory: IBuildingFactory,
        settings: BuildingSettings,
        elevatorConfigs?: ElevatorConfig[]
    ): Building {
        // Create the building instance
        const building = factory.createBuilding(settings);

        // Create elevators with their specific configs if available
        Array.from({ length: settings.defaultBuildingConfig.numberOfElevators }, (_, i) => {
            // Merge default config with any elevator-specific overrides
            const elevatorConfig = elevatorConfigs?.[i] ? {
                ...settings.defaultElevatorConfig,
                ...elevatorConfigs[i]
            } : settings.defaultElevatorConfig;

            const elevator = factory.createElevator(i, settings, elevatorConfig);
            building.addElevator(elevator);
        });

        // Create and initialize all floors
        Array.from({ length: settings.defaultBuildingConfig.numberOfFloors }, (_, i) => {
            const floor = factory.createFloor(i);
            if (i === 0) {  // Initialize ground floor with elevators
                // Set initial state for ground floor without playing sound
                Array(settings.defaultBuildingConfig.numberOfElevators)
                    .fill(null)
                    .forEach(() => floor.initializeWithElevator());
            }
            building.addFloor(floor);
        });

        return building;
    }
}