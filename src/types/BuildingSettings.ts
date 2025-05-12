/**
 * Configuration interface for building and elevator parameters
 */
export interface BuildingSettings {
    // Building-specific settings
    numberOfBuildings: number;   // Total number of buildings in the simulation
    numberOfFloors: number;      // Total number of floors in each building
    numberOfElevators: number;   // Total number of elevators serving each building

    // Elevator movement settings
    floorHeight: number;         // Height of each floor in pixels
    stopDelay: number;          // Time in seconds elevator waits at each stop
    floorPassingTime: number;    // Time in seconds to pass each floor during movement
}

/**
 * Default configuration values for the building
 */
export const DefaultSettings: BuildingSettings = {
    numberOfBuildings: 1,
    numberOfFloors: 10,
    numberOfElevators: 2,
    floorHeight: 110,  // 110px total floor height (including 7px black bar)
    stopDelay: 2.0,    // Seconds
    floorPassingTime: 0.5  // Seconds per floor
};