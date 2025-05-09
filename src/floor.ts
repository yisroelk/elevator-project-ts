/**
 * Type definition for event handlers
 */
type EventHandler = (timeLeft: number) => void;

/**
 * Represents a floor in the building
 * Manages floor state including button press status and elevator presence
 */
export class Floor {
    private _hasElevator: boolean = false;      // Tracks if an elevator is currently at this floor
    private _isButtonPressed: boolean = false;   // Tracks if the call button is currently pressed
    private _countdownInterval: number | null = null;  // Interval ID for countdown updates
    private _eventHandlers: { [key: string]: EventHandler[] } = {};  // Event handlers
    private _countdownValue: number = 0;  // Current countdown value in tenths of seconds

    constructor(public readonly number: number) { }

    /**
     * Checks if an elevator is currently at this floor
     */
    get hasElevator(): boolean {
        return this._hasElevator;
    }

    /**
     * Updates the elevator presence status for this floor
     */
    set hasElevator(value: boolean) {
        this._hasElevator = value;
        if (value) {
            this.stopCountdown();
        }
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
        return this._isButtonPressed || this._hasElevator;
    }

    /**
     * Add an event handler for the specified event
     */
    on(event: string, handler: EventHandler) {
        if (!this._eventHandlers[event]) {
            this._eventHandlers[event] = [];
        }
        this._eventHandlers[event].push(handler);
    }

    /**
     * Emit an event with the given value
     */
    private emit(event: string, value: number) {
        const handlers = this._eventHandlers[event];
        if (handlers) {
            handlers.forEach(handler => handler(value));
        }
    }

    /**
     * Start countdown for elevator arrival
     */
    startCountdown(totalTime: number) {
        this.stopCountdown();
        this._countdownValue = Math.max(0, totalTime / 1000); // Convert milliseconds to seconds
        console.log('Starting countdown for floor', this.number, 'with time', this._countdownValue);

        const updateInterval = 100; // Update every 100ms
        this._countdownInterval = window.setInterval(() => {
            this._countdownValue = Math.max(0, this._countdownValue - 0.1);
            this.emit('countdown', parseFloat(this._countdownValue.toFixed(1)));

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
            this.emit('countdown', 0);
        }
    }

    /**
     * Marks the floor's call button as pressed when requesting an elevator
     */
    pressButton(): void {
        this._isButtonPressed = true;
    }

    /**
     * Resets the floor's call button state when the request is fulfilled
     */
    resetButton(): void {
        this._isButtonPressed = false;
        this.stopCountdown();
    }

    /**
     * Handles elevator departure from this floor
     */
    elevatorLeft(): void {
        this._hasElevator = false;
        if (!this._isButtonPressed) {
            return;
        }
        this._isButtonPressed = false;
    }
}