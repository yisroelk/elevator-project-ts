import { SettingsManager } from '../core/SettingsManager';
import { DomUtils } from '../utils/DomUtils';
import { CSS_CLASSES } from '../styles/classes';

/**
 * Creates the settings panel UI
 * @returns An object containing the panel element, overlay element, and toggle button
 */
export function createSettingsPanel() {
    const settingsManager = SettingsManager.getInstance();
    const currentSettings = settingsManager.getSettings();

    // Create elements using DomUtils
    const panel = DomUtils.createElement('div', CSS_CLASSES.SETTINGS_PANEL, {
        'role': 'dialog',
        'aria-labelledby': 'settings-title'
    });
    const overlay = DomUtils.createElement('div', CSS_CLASSES.SETTINGS_OVERLAY);
    const settingsToggle = DomUtils.createElement('button', CSS_CLASSES.SETTINGS_TOGGLE, {
        'aria-label': 'Open Settings',
        'aria-controls': 'settings-panel',
        'aria-expanded': 'false'
    });
    settingsToggle.textContent = 'Settings';

    panel.id = 'settings-panel';
    panel.innerHTML = `
        <h2 id="settings-title" tabindex="-1">Building Settings</h2>
        <div class="${CSS_CLASSES.SETTINGS_GROUP}" role="form">
            <label for="numberOfBuildings">Number of Buildings</label>
            <input type="number" id="numberOfBuildings" value="${currentSettings.numberOfBuildings}" 
                min="1" max="4" aria-describedby="buildings-desc">

            <label for="numberOfFloors">Number of Floors</label>
            <input type="number" id="numberOfFloors" value="${currentSettings.numberOfFloors}" 
                min="2" max="20" aria-describedby="floors-desc">
            
            <label for="numberOfElevators">Number of Elevators per Building</label>
            <input type="number" id="numberOfElevators" value="${currentSettings.numberOfElevators}" 
                min="1" max="4" aria-describedby="elevators-desc">
            
            <label for="floorHeight">Floor Height (px)</label>
            <input type="number" id="floorHeight" value="${currentSettings.floorHeight}" 
                min="50" max="200" aria-describedby="height-desc">
            
            <label for="stopDelay">Stop Delay (seconds)</label>
            <input type="number" id="stopDelay" value="${currentSettings.stopDelay}" 
                min="1" max="10" step="0.5" aria-describedby="delay-desc">
            
            <label for="floorPassingTime">Floor Passing Time (seconds)</label>
            <input type="number" id="floorPassingTime" value="${currentSettings.floorPassingTime}" 
                min="0.1" max="2" step="0.1" aria-describedby="passing-desc">
        </div>
        <button class="${CSS_CLASSES.APPLY_BUTTON}" aria-label="Apply Settings">Apply Settings</button>
    `;

    // Add event handlers
    settingsToggle.onclick = () => {
        const isVisible = panel.classList.toggle(CSS_CLASSES.VISIBLE);
        overlay.classList.toggle(CSS_CLASSES.VISIBLE);
        settingsToggle.setAttribute('aria-expanded', isVisible.toString());
        if (isVisible) {
            const title = panel.querySelector('#settings-title');
            if (title instanceof HTMLElement) title.focus();
        }
    };

    overlay.onclick = () => {
        panel.classList.remove(CSS_CLASSES.VISIBLE);
        overlay.classList.remove(CSS_CLASSES.VISIBLE);
        settingsToggle.setAttribute('aria-expanded', 'false');
        settingsToggle.focus();
    };

    // Handle Escape key
    panel.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            overlay.click();
        }
    });

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
                    stopDelay: Number((panel.querySelector('#stopDelay') as HTMLInputElement).value),
                    floorPassingTime: Number((panel.querySelector('#floorPassingTime') as HTMLInputElement).value),
                };

                settingsManager.updateSettings(newSettings);
                onApply();
                overlay.click();
            };
        }
    };
}