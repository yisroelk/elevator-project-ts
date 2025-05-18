import { Elevator } from './elevator';
import { BuildingSettings, ElevatorConfig } from '../types/BuildingSettings';

export class ExpressElevator extends Elevator {
    // Speed multiplier for express mode - moves twice as fast
    private readonly EXPRESS_SPEED_MULTIPLIER = 2;
    // Minimum floor difference required to activate express mode
    private readonly EXPRESS_MODE_THRESHOLD = 5;

    constructor(id: number, settings: BuildingSettings, elevatorConfig?: ElevatorConfig) {
        super(id, settings, elevatorConfig);
    }

    /**
     * Override getTimeToRequestedFloor to implement express elevator timing
     */
    getTimeToRequestedFloor(requestedFloor?: number): number {
        // Get base time calculation from parent class
        const baseTime = super.getTimeToRequestedFloor(requestedFloor);

        if (requestedFloor !== undefined) {
            const floorDifference = Math.abs(this.currentFloor - requestedFloor);
            // Apply express speed for long-distance trips only
            if (floorDifference >= this.EXPRESS_MODE_THRESHOLD) {
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
            // Check if the distance qualifies for express mode
            if (floorDifference >= this.EXPRESS_MODE_THRESHOLD) {
                // Temporarily adjust movement speed for express travel
                const originalFloorPassingTime = this.elevatorConfig.floorPassingTime;
                this.elevatorConfig.floorPassingTime /= this.EXPRESS_SPEED_MULTIPLIER;
                super.updatePosition();
                // Restore original speed after update
                this.elevatorConfig.floorPassingTime = originalFloorPassingTime;
                return;
            }
        }

        super.updatePosition();
    }
}