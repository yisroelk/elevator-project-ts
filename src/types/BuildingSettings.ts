/**
 * Configuration interface for individual elevator parameters
 */
export interface ElevatorConfig {
    stopDelay: number;          // Time in seconds elevator waits at each stop
    floorPassingTime: number;    // Time in seconds to pass each floor during movement
}

/**
 * Configuration interface for individual building parameters
 */
export interface BuildingConfig {
    factoryType: 'standard' | 'highrise';  // Determines elevator type and behavior
    numberOfFloors: number;                 // Total floors in the building
    numberOfElevators: number;              // Number of elevators to create
    floorHeight: number;                    // Height of each floor in pixels
    elevatorConfigs: ElevatorConfig[];      // Per-elevator settings overrides
}

/**
 * Main settings interface for the entire elevator system
 */
export interface BuildingSettings {
    numberOfBuildings: number;              // Total number of buildings to simulate
    defaultElevatorConfig: ElevatorConfig;  // Global defaults for all elevators
    defaultBuildingConfig: {                // Global defaults for all buildings
        factoryType: 'standard' | 'highrise';
        numberOfFloors: number;
        numberOfElevators: number;
        floorHeight: number;
    };
    buildingConfigs: BuildingConfig[];      // Per-building configuration overrides
}

/**
 * Default configuration values for the building system
 * Used when no custom settings are provided
 */
export const DefaultSettings: BuildingSettings = {
    numberOfBuildings: 1,
    defaultBuildingConfig: {
        factoryType: 'standard',           // Use standard elevators by default
        numberOfFloors: 10,                // 10-story default height
        numberOfElevators: 2,              // 2 elevators per building
        floorHeight: 110                   // 110px total floor height (including 7px black bar)
    },
    defaultElevatorConfig: {
        stopDelay: 2.0,                    // 2 second stop duration
        floorPassingTime: 0.5              // 0.5 seconds to pass each floor
    },
    buildingConfigs: []                    // Empty array populated with copies of defaults on initialization
}