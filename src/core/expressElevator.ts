import { Elevator } from './elevator';
import { BuildingSettings } from '../types/BuildingSettings';

export class ExpressElevator extends Elevator {
    private readonly EXPRESS_SPEED_MULTIPLIER = 2;
    private readonly EXPRESS_MODE_THRESHOLD = 5; // Minimum floor difference to use express mode

    constructor(id: number, settings: BuildingSettings) {
        super(id, settings);
    }

    /**
     * Override getTimeToRequestedFloor to implement express elevator timing
     */
    getTimeToRequestedFloor(requestedFloor?: number): number {
        const baseTime = super.getTimeToRequestedFloor(requestedFloor);

        if (requestedFloor !== undefined) {
            const floorDifference = Math.abs(this.currentFloor - requestedFloor);
            if (floorDifference >= this.EXPRESS_MODE_THRESHOLD) {
                // Reduce travel time for long-distance trips
                return baseTime / this.EXPRESS_SPEED_MULTIPLIER;
            }
        }

        return baseTime;
    }

    /**
     * Override updatePosition to implement faster movement for express mode
     */
    protected updatePosition(): void {
        if (this.currentDestination !== null) {
            const floorDifference = Math.abs(this.currentFloor - this.currentDestination);
            if (floorDifference >= this.EXPRESS_MODE_THRESHOLD) {
                // Temporarily modify settings for faster movement
                const originalFloorPassingTime = this.settings.floorPassingTime;
                this.settings.floorPassingTime /= this.EXPRESS_SPEED_MULTIPLIER;
                super.updatePosition();
                this.settings.floorPassingTime = originalFloorPassingTime;
                return;
            }
        }

        super.updatePosition();
    }
}