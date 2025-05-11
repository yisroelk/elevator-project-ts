/**
 * Interface defining settings for elevator behavior and movement
 */
export interface ElevatorSettings {
    floorHeight: number;         // Height of each floor in pixels
    movementSpeed: number;       // Time to move between floors in seconds
    stopDelay: number;          // Time to wait at each floor in seconds
    floorPassingTime: number;    // Time to pass each floor in seconds
}