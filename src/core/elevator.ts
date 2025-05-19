import { BuildingSettings, ElevatorConfig } from '../types/BuildingSettings';
import { EventEmitter } from '../utils/EventEmitter';
import { BuildingEvents } from '../types/BuildingEvents';
import { BuildingEventMap } from '../types/BuildingEvents';

/**
 * Represents an elevator in the building
 * Handles movement, scheduling, and time estimation for elevator operations
 */
interface ElevatorEventMap {
    'arrival': Elevator;
    'move': Elevator;
    'floor-passed': { floor: number };
    [BuildingEvents.ELEVATOR_REQUESTED]: BuildingEventMap[BuildingEvents.ELEVATOR_REQUESTED];
    [BuildingEvents.END_FLOOR_STOP]: { floor: number };
    [BuildingEvents.ELEVATOR_POSITION_CHANGED]: BuildingEventMap[BuildingEvents.ELEVATOR_POSITION_CHANGED];
}

enum ElevatorState {
    IDLE = 'idle',
    MOVING = 'moving',
    STOPPING = 'stopping'
}

export class Elevator extends EventEmitter<ElevatorEventMap> {
    id: number;
    currentFloor: number = 0;
    private targetFloors: number[] = [];
    private state: ElevatorState = ElevatorState.IDLE;
    private lastIntendedFloor: number = 0;
    protected settings: BuildingSettings;
    protected elevatorConfig: ElevatorConfig;
    currentDestination: number | null = null;
    previousFloor: number | null = null;
    timeStartFloorStop: number = 0;

    // Physical position tracking
    private exactPosition: number = 0;  // Position in floors (can be fractional)
    private movementStartTime: number | null = null;
    private lastPassedFloor: number = 0;
    private updateInterval: number | null = null;
    private readonly UPDATE_FREQUENCY = 60;


    private timeouts: number[] = [];

    constructor(id: number, settings: BuildingSettings, elevatorConfig?: ElevatorConfig) {
        super();
        this.id = id;
        this.settings = settings;
        // Always use provided elevatorConfig if available, otherwise use default
        this.elevatorConfig = {
            ...settings.defaultElevatorConfig,
            ...(elevatorConfig || {})
        };
        this.exactPosition = 0;
    }

    /**
     * Gets the elevator's configuration settings
     */
    getElevatorConfig(): ElevatorConfig {
        return this.elevatorConfig;
    }

    /**
     * Calculates time until reaching a requested floor, considering current movement and queue
     * If no floor is provided, calculates total journey time for all queued floors
     * @param requestedFloor Optional floor to calculate time to. If not provided, calculates total journey time
     * @returns Time in milliseconds
     */
    getTimeToRequestedFloor(requestedFloor?: number): number {
        let totalTime = 0;
        let currentPosition = this.currentFloor;
        const now = Date.now();

        // If elevator is moving, add remaining time to current destination
        if (this.state === ElevatorState.MOVING && this.currentDestination !== null && this.movementStartTime) {
            const remainingDistance = Math.abs(this.currentDestination - this.exactPosition);
            const remainingTime = remainingDistance * this.elevatorConfig.floorPassingTime * 1000;

            // If this is the requested floor, don't include stop time
            if (requestedFloor !== undefined && this.currentDestination === requestedFloor) {
                return totalTime + remainingTime;
            }

            totalTime += remainingTime + this.elevatorConfig.stopDelay * 1000;
            currentPosition = this.currentDestination;
        }

        // If elevator is stopping, add remaining stop time
        if (this.state === ElevatorState.STOPPING) {
            const timeSinceStopStart = now - this.timeStartFloorStop;
            const stopDelay = this.elevatorConfig.stopDelay * 1000;
            const remainingStopTime = Math.max(0, stopDelay - timeSinceStopStart);
            totalTime += remainingStopTime;
        }

        // Calculate time through the queue
        for (const floor of this.targetFloors) {
            const distance = Math.abs(floor - currentPosition);
            const transitTime = distance * this.elevatorConfig.floorPassingTime * 1000;

            // If this is the requested floor, return time without stop delay
            if (requestedFloor !== undefined && floor === requestedFloor) {
                return totalTime + transitTime;
            }

            // For intermediate floors, include both transit and stop time
            totalTime += transitTime + this.elevatorConfig.stopDelay * 1000;
            currentPosition = floor;
        }

        // If requested floor wasn't found in queue or we're calculating total journey time
        if (requestedFloor !== undefined) {
            // Calculate time to requested floor from last position
            const finalDistance = Math.abs(requestedFloor - currentPosition);
            const finalTransitTime = finalDistance * this.elevatorConfig.floorPassingTime * 1000;
            return totalTime + finalTransitTime;
        }

        return totalTime;
    }

    assignFloor(floor: number) {
        if (!this.targetFloors.includes(floor)) {
            this.targetFloors.push(floor);
            this.lastIntendedFloor = floor;

            const completionTime = this.getTimeToRequestedFloor();

            // Format the completion time properly
            const estimatedDate = new Date(completionTime);
            const secondsUntilCompletion = Math.round((completionTime) / 1000);

            console.log(`Floor ${floor} assigned. Estimated completion: ${estimatedDate.toISOString()} (in ${secondsUntilCompletion}s) elevator ${this.id}`);

            if (this.state === ElevatorState.IDLE) {
                this.move();
            }
        }
    }

    /**
     * Initiates elevator movement to the next target floor
     */
    move(): void {
        if (this.state === ElevatorState.MOVING || this.state === ElevatorState.STOPPING || this.targetFloors.length === 0) return;

        const nextFloor = this.targetFloors[0];
        const now = Date.now();
        console.log(`Starting move to floor ${nextFloor} at ${new Date(now).toISOString()} elevator ${this.id}`);
        this.state = ElevatorState.MOVING;
        this.targetFloors.shift();
        this.currentDestination = nextFloor;
        this.previousFloor = this.currentFloor;
        this.movementStartTime = now;
        this.startMovementUpdates();
        this.emit('move', this);
    }

    /**
     * Updates internal position and emits events during movement
     */
    protected updatePosition(): void {
        if (this.state !== ElevatorState.MOVING || !this.movementStartTime || this.currentDestination === null) {
            this.stopMovementUpdates();
            return;
        }

        const now = Date.now();
        const elapsedTime = (now - this.movementStartTime) / 1000;
        const totalDistance = Math.abs(this.currentDestination - this.previousFloor!);
        const totalTime = totalDistance * this.elevatorConfig.floorPassingTime;
        const progress = Math.min(elapsedTime / totalTime, 1);

        // Calculate new position
        const direction = this.currentDestination > this.previousFloor! ? 1 : -1;
        this.exactPosition = this.previousFloor! + (totalDistance * progress * direction);

        // Check for floor passing
        const currentFloor = Math.floor(this.exactPosition);
        if (currentFloor !== this.lastPassedFloor) {
            this.lastPassedFloor = currentFloor;
            this.emit('floor-passed', { floor: currentFloor });
            console.log(`Passing floor ${currentFloor} at ${new Date(now).toISOString()} elevator ${this.id}`);
        }

        this.emit(BuildingEvents.ELEVATOR_POSITION_CHANGED, {
            elevator: this.id,
            position: this.exactPosition
        });

        if (progress >= 1) {
            this.stopMovementUpdates();
            this.handleArrival();
        }
    }

    /**
     * Starts the position update interval
     */
    private startMovementUpdates(): void {
        this.stopMovementUpdates();
        const updateDelay = 1000 / this.UPDATE_FREQUENCY;
        this.updateInterval = window.setInterval(() => this.updatePosition(), updateDelay);
    }

    /**
     * Stops the position update interval
     */
    private stopMovementUpdates(): void {
        if (this.updateInterval !== null) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Handles elevator arrival at destination
     */
    private handleArrival(): void {
        this.state = ElevatorState.STOPPING;
        this.exactPosition = this.currentDestination!;
        this.currentFloor = this.currentDestination!;
        this.timeStartFloorStop = Date.now();

        console.log(`Arrived at floor ${this.currentFloor} at ${new Date().toISOString()} elevator ${this.id}`);

        this.emit('arrival', this);

        const stopTimeout = window.setTimeout(() => {
            if (this.state === ElevatorState.STOPPING) {
                this.emit(BuildingEvents.END_FLOOR_STOP, {
                    floor: this.currentFloor
                });

                this.state = ElevatorState.IDLE;
                this.timeStartFloorStop = 0;
                if (this.targetFloors.length > 0) {
                    this.move();
                } else {
                    this.currentDestination = null;
                    console.log(`All floors completed at ${new Date().toISOString()} elevator ${this.id}`);
                }
            }
        }, this.elevatorConfig.stopDelay * 1000);

        this.timeouts.push(stopTimeout);
    }

    /**
     * Cleans up resources used by this elevator
     */
    dispose(): void {
        // Clear any pending timeouts
        this.timeouts.forEach(timeout => window.clearTimeout(timeout));
        this.timeouts = [];

        // Stop movement updates
        this.stopMovementUpdates();

    }
}