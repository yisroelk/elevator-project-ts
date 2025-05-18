import { Building } from './building';
import { Elevator } from './elevator';
import { Floor } from './floor';
import { BuildingSettings } from '../types/BuildingSettings';
import { BuildingFactoryBase } from './abstractBuildingFactory';

/**
 * Standard building factory implementation
 */
export class StandardBuildingFactory extends BuildingFactoryBase {
    createBuilding(settings: BuildingSettings): Building {
        return new Building(settings);
    }

    createElevator(id: number, settings: BuildingSettings): Elevator {
        return new Elevator(id, settings);
    }

    createFloor(number: number): Floor {
        return new Floor(number);
    }
}

// Default factory instance for backward compatibility
export class BuildingFactory extends StandardBuildingFactory { }