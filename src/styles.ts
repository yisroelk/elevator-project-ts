import { STYLES } from './constants/styles.js';

/**
 * Creates and injects CSS styles for the elevator simulation
 */
export function createStyles() {
    const style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);
}