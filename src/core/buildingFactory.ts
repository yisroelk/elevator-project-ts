import { Building } from './building';
import { Elevator } from './elevator';
import { Floor } from './floor';
import { BuildingSettings, ElevatorConfig } from '../types/BuildingSettings';
import { BuildingFactoryBase } from './abstractBuildingFactory';

/**
 * Standard building factory implementation
 * Creates basic buildings with regular elevators
 */
export class StandardBuildingFactory extends BuildingFactoryBase {
    // Create a standard building with default configuration
    createBuilding(settings: BuildingSettings): Building {
        return new Building(settings);
    }

    // Create a regular elevator with standard speed settings
    createElevator(id: number, settings: BuildingSettings, elevatorConfig?: ElevatorConfig): Elevator {
        return new Elevator(id, settings, elevatorConfig);
    }

    // Create a standard floor with basic functionality
    createFloor(number: number): Floor {
        return new Floor(number);
    }
}

// Maintain backward compatibility with existing code
export class BuildingFactory extends StandardBuildingFactory { }