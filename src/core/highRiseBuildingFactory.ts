import { BuildingFactoryBase } from './abstractBuildingFactory';
import { Building } from './building';
import { Floor } from './floor';
import { BuildingSettings, ElevatorConfig } from '../types/BuildingSettings';
import { ExpressElevator } from './expressElevator';

/**
 * Factory implementation for high-rise buildings
 * Creates buildings equipped with express elevators for faster long-distance travel
 */
export class HighRiseBuildingFactory extends BuildingFactoryBase {
    // Create a building configured for high-rise operation
    createBuilding(settings: BuildingSettings): Building {
        return new Building(settings);
    }

    // Create an express elevator with enhanced speed capabilities for long distances
    createElevator(id: number, settings: BuildingSettings, elevatorConfig?: ElevatorConfig): ExpressElevator {
        return new ExpressElevator(id, settings, elevatorConfig);
    }

    // Create a standard floor - no special requirements for high-rise buildings
    createFloor(number: number): Floor {
        return new Floor(number);
    }
}