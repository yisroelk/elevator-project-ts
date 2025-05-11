/**
 * Configuration interface for building parameters
 */
export interface BuildingSettings {
    numberOfBuildings: number;   // Total number of buildings in the simulation
    numberOfFloors: number;      // Total number of floors in each building
    numberOfElevators: number;   // Total number of elevators serving each building
    floorHeight: number;         // Height of each floor in pixels
    movementSpeed: number;       // Time in seconds for elevator to move between floors
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
    floorHeight: 100,
    movementSpeed: 1,
    stopDelay: 2,
    floorPassingTime: 0.5
};