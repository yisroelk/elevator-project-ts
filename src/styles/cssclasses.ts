/**
 * Centralized CSS class names used throughout the application
 * Ensures consistent styling and makes refactoring easier
 */
export const CSS_CLASSES = {
    // Layout classes
    CONTAINER: 'container',                   // Main container for all buildings
    BUILDING: 'building',                     // Individual building wrapper
    BUILDING_CONTAINER: 'building-container', // Container for a single building and its title
    BUILDING_WRAPPER: 'building-wrapper',     // Wrapper for building and its elevators

    // Building elements
    BUILDING_TITLE: 'building-title',         // Building title/header
    FLOOR: 'floor',                          // Individual floor container
    FLOOR_NUMBER: 'floor-number',            // Floor number display
    ELEVATOR: 'elevator',                    // Individual elevator
    ELEVATOR_CONTAINER: 'elevator-container', // Container for all elevators

    // Interactive elements
    BUTTON: 'floor-button',                  // Floor call button
    PRESSED: 'pressed',                      // State class for pressed buttons
    COUNTDOWN: 'countdown',                   // Countdown timer display

    // Settings panel classes
    SETTINGS_PANEL: 'settings-panel',        // Settings panel container
    SETTINGS_OVERLAY: 'settings-overlay',     // Overlay behind settings panel
    SETTINGS_TOGGLE: 'settings-toggle',       // Settings panel toggle button
    SETTINGS_GROUP: 'settings-group',         // Group of related settings
    APPLY_BUTTON: 'apply-button',            // Settings apply button

    // Utility classes
    VISIBLE: 'visible',                      // Visibility toggle class
};