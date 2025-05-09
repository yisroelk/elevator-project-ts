/**
 * Represents a floor in the building
 * Manages floor state including button press status and elevator presence
 */
export class Floor {
    private _hasElevator: boolean = false;      // Tracks if an elevator is currently at this floor
    private _isButtonPressed: boolean = false;   // Tracks if the call button is currently pressed

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
    }

    /**
     * Checks if the floor's call button is currently pressed
     */
    get isButtonPressed(): boolean {
        return this._isButtonPressed;
    }

    /**
     * Determines if the floor's call button should be disabled
     * Button is disabled if either:
     * 1. The button is currently pressed (waiting for elevator)
     * 2. An elevator is currently at this floor
     */
    get shouldButtonBeDisabled(): boolean {
        return this._isButtonPressed || this._hasElevator;
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
    }

    /**
     * Handles elevator departure from this floor
     * Updates elevator presence and resets button state if needed
     */
    elevatorLeft(): void {
        this._hasElevator = false;
        // Only enable the button if it's not already pressed
        if (!this._isButtonPressed) {
            return;
        }
        this._isButtonPressed = false;  // Reset the button state when elevator leaves
    }
}