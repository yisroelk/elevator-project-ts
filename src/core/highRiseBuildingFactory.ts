import { BuildingFactoryBase } from './abstractBuildingFactory';
import { Building } from './building';
import { Floor } from './floor';
import { BuildingSettings } from '../types/BuildingSettings';
import { ExpressElevator } from './expressElevator';

/**
 * Factory implementation for high-rise buildings with express elevators
 */
export class HighRiseBuildingFactory extends BuildingFactoryBase {
    createBuilding(settings: BuildingSettings): Building {
        // Could extend Building class for high-rise specific features
        return new Building(settings);
    }

    createElevator(id: number, settings: BuildingSettings): ExpressElevator {
        return new ExpressElevator(id, settings);
    }

    createFloor(number: number): Floor {
        return new Floor(number);
    }
}