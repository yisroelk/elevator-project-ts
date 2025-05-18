/**
 * Configuration interface for building and elevator parameters
 */
export interface ElevatorConfig {
    stopDelay: number;          // Time in seconds elevator waits at each stop
    floorPassingTime: number;    // Time in seconds to pass each floor during movement
}

export interface BuildingConfig {
    factoryType: 'standard' | 'highrise';
    numberOfFloors: number;
    numberOfElevators: number;
    floorHeight: number;         // Height of each floor in pixels
    elevatorConfigs: ElevatorConfig[];  // Per-elevator settings
}

export interface BuildingSettings {
    numberOfBuildings: number;
    defaultElevatorConfig: ElevatorConfig;  // Global defaults for all elevators
    defaultBuildingConfig: {    // Global defaults for all buildings
        factoryType: 'standard' | 'highrise';
        numberOfFloors: number;
        numberOfElevators: number;
        floorHeight: number;
    };
    buildingConfigs: BuildingConfig[];  // Per-building configurations
}

/**
 * Default configuration values for the building
 */
export const DefaultSettings: BuildingSettings = {
    numberOfBuildings: 1,
    defaultBuildingConfig: {
        factoryType: 'standard',
        numberOfFloors: 10,
        numberOfElevators: 2,
        floorHeight: 110  // 110px total floor height (including 7px black bar)
    },
    defaultElevatorConfig: {
        stopDelay: 2.0,    // Seconds
        floorPassingTime: 0.5  // Seconds per floor
    },
    buildingConfigs: []  // Will be populated with copies of defaults on initialization
};