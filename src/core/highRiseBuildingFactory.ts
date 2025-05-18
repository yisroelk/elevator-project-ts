import { BuildingFactoryBase } from './abstractBuildingFactory';
import { Building } from './building';
import { Floor } from './floor';
import { BuildingSettings, ElevatorConfig } from '../types/BuildingSettings';
import { ExpressElevator } from './expressElevator';

/**
 * Factory implementation for high-rise buildings with express elevators
 */
export class HighRiseBuildingFactory extends BuildingFactoryBase {
    createBuilding(settings: BuildingSettings): Building {
        return new Building(settings);
    }

    createElevator(id: number, settings: BuildingSettings, elevatorConfig?: ElevatorConfig): ExpressElevator {
        return new ExpressElevator(id, settings, elevatorConfig);
    }

    createFloor(number: number): Floor {
        return new Floor(number);
    }
}