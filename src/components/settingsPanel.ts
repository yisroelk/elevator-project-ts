import { SettingsManager } from '../core/SettingsManager.js';
import { DomUtils } from '../utils/DomUtils.js';
import { CSS_CLASSES } from '../constants/settings.js';

/**
 * Creates the settings panel UI
 * @returns An object containing the panel element, overlay element, and toggle button
 */
export function createSettingsPanel() {
    const settingsManager = SettingsManager.getInstance();
    const currentSettings = settingsManager.getSettings();

    // Create elements using DomUtils
    const panel = DomUtils.createElement('div', CSS_CLASSES.SETTINGS_PANEL);
    const overlay = DomUtils.createElement('div', 'settings-overlay');
    const settingsToggle = DomUtils.createElement('button', 'settings-toggle');
    settingsToggle.textContent = 'Settings';

    panel.innerHTML = `
        <h2>Building Settings</h2>
        <div class="settings-group">
            <label for="numberOfBuildings">Number of Buildings</label>
            <input type="number" id="numberOfBuildings" value="${currentSettings.numberOfBuildings}" min="1" max="4">
            
            <label for="numberOfFloors">Number of Floors</label>
            <input type="number" id="numberOfFloors" value="${currentSettings.numberOfFloors}" min="2" max="20">
            
            <label for="numberOfElevators">Number of Elevators per Building</label>
            <input type="number" id="numberOfElevators" value="${currentSettings.numberOfElevators}" min="1" max="4">
            
            <label for="floorHeight">Floor Height (px)</label>
            <input type="number" id="floorHeight" value="${currentSettings.floorHeight}" min="50" max="200">
            
            <label for="movementSpeed">Movement Speed (seconds)</label>
            <input type="number" id="movementSpeed" value="${currentSettings.movementSpeed}" min="0.5" max="5" step="0.5">
            
            <label for="stopDelay">Stop Delay (seconds)</label>
            <input type="number" id="stopDelay" value="${currentSettings.stopDelay}" min="1" max="10" step="0.5">
            
            <label for="floorPassingTime">Floor Passing Time (seconds)</label>
            <input type="number" id="floorPassingTime" value="${currentSettings.floorPassingTime}" min="0.1" max="2" step="0.1">
        </div>
        <button class="apply-button">Apply Settings</button>
    `;

    // Add event handlers
    settingsToggle.onclick = () => {
        panel.classList.toggle('visible');
        overlay.classList.toggle('visible');
    };

    overlay.onclick = () => {
        panel.classList.remove('visible');
        overlay.classList.remove('visible');
    };

    return {
        panel,
        overlay,
        settingsToggle,
        setupApplyButton: (onApply: () => void) => {
            const applyButton = panel.querySelector('.apply-button') as HTMLButtonElement;
            applyButton.onclick = () => {
                const newSettings = {
                    numberOfBuildings: Number((panel.querySelector('#numberOfBuildings') as HTMLInputElement).value),
                    numberOfFloors: Number((panel.querySelector('#numberOfFloors') as HTMLInputElement).value),
                    numberOfElevators: Number((panel.querySelector('#numberOfElevators') as HTMLInputElement).value),
                    floorHeight: Number((panel.querySelector('#floorHeight') as HTMLInputElement).value),
                    movementSpeed: Number((panel.querySelector('#movementSpeed') as HTMLInputElement).value),
                    stopDelay: Number((panel.querySelector('#stopDelay') as HTMLInputElement).value),
                    floorPassingTime: Number((panel.querySelector('#floorPassingTime') as HTMLInputElement).value),
                };

                settingsManager.updateSettings(newSettings);
                onApply();
                panel.classList.remove('visible');
                overlay.classList.remove('visible');
            };
        }
    };
}