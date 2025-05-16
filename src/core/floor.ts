import { EventEmitter } from '../utils/EventEmitter';
import { BuildingEvents } from '../types/BuildingEvents';
import { BuildingEventMap } from '../types/BuildingTypes';

interface FloorEventMap {
    [BuildingEvents.COUNTDOWN_CHANGED]: BuildingEventMap[BuildingEvents.COUNTDOWN_CHANGED];
    [BuildingEvents.FLOOR_UPDATED]: Floor;
}

/**
 * Represents a floor in the building
 * Manages floor state including button press status and elevator presence
 */
export class Floor extends EventEmitter<FloorEventMap> {
    private _elevatorCount: number = 0;      // Tracks number of elevators currently at this floor
    private _isButtonPressed: boolean = false;   // Tracks if the call button is currently pressed
    private _countdownInterval: number | null = null;  // Interval ID for countdown updates
    private _countdownValue: number = 0;  // Current countdown value in tenths of seconds
    private readonly _audio: HTMLAudioElement;
    private readonly _audioLoaded: Promise<void>;

    constructor(public readonly number: number) {
        super();
        this._audio = new Audio('/assets/ding.mp3');
        // Create a promise to track audio loading
        this._audioLoaded = new Promise((resolve) => {
            this._audio.addEventListener('canplaythrough', () => resolve());
        });
        this._audio.load();
    }

    /**
     * Checks if any elevator is currently at this floor
     */
    get hasElevator(): boolean {
        return this._elevatorCount > 0;
    }

    /**
     * Updates the elevator presence status for this floor
     */
    set hasElevator(value: boolean) {
        if (value) {
            this._elevatorCount++;
            this.stopCountdown();
            // Play sound only if audio is loaded
            this._audioLoaded
                .then(() => this._audio.play())
                .catch(err => console.warn('Audio playback failed:', err));
            this.emit(BuildingEvents.FLOOR_UPDATED, this);
        } else {
            this._elevatorCount = Math.max(0, this._elevatorCount - 1);
            this.emit(BuildingEvents.FLOOR_UPDATED, this);
        }
    }

    /**
     * Gets the current number of elevators on this floor
     */
    get elevatorCount(): number {
        return this._elevatorCount;
    }

    /**
     * Gets the current countdown value in tenths of seconds
     */
    get countdown(): number {
        return this._countdownValue;
    }

    /**
     * Checks if the floor's call button is currently pressed
     */
    get isButtonPressed(): boolean {
        return this._isButtonPressed;
    }

    /**
     * Determines if the floor's call button should be disabled
     */
    get shouldButtonBeDisabled(): boolean {
        return this._isButtonPressed || this._elevatorCount > 0;
    }

    /**
     * Start countdown for elevator arrival
     */
    startCountdown(totalTime: number) {
        this.stopCountdown();
        this._countdownValue = Math.max(0, totalTime / 1000); // Convert milliseconds to seconds

        const startTime = Date.now();
        const updateInterval = 100; // Update every 100ms

        this._countdownInterval = window.setInterval(() => {
            const elapsedTime = (Date.now() - startTime) / 1000;
            const newCountdownValue = Math.max(0, (totalTime / 1000) - elapsedTime);

            // Only update and emit if the value has changed significantly
            if (Math.abs(this._countdownValue - newCountdownValue) >= 0.05) {
                this._countdownValue = newCountdownValue;
                this.emit(BuildingEvents.COUNTDOWN_CHANGED, {
                    floor: this.number,
                    timeLeft: this._countdownValue
                });
            }

            if (this._countdownValue <= 0) {
                this.stopCountdown();
            }
        }, updateInterval);
    }

    /**
     * Stop the countdown timer
     */
    private stopCountdown() {
        if (this._countdownInterval !== null) {
            clearInterval(this._countdownInterval);
            this._countdownInterval = null;
            this._countdownValue = 0;
            this.emit(BuildingEvents.COUNTDOWN_CHANGED, {
                floor: this.number,
                timeLeft: 0
            });
        }
    }

    /**
     * Marks the floor's call button as pressed when requesting an elevator
     */
    pressButton(): void {
        this._isButtonPressed = true;
        this.emit(BuildingEvents.FLOOR_UPDATED, this);
    }

    /**
     * Resets the floor's call button state when the request is fulfilled
     */
    resetButton(): void {
        this._isButtonPressed = false;
        this.stopCountdown();
        this.emit(BuildingEvents.FLOOR_UPDATED, this);
    }


    /**
     * Handles elevator departure from this floor
     */
    elevatorLeft(): void {
        this.hasElevator = false;
    }
}