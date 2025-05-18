import { SettingsManager } from '../core/SettingsManager';
import { DomUtils } from '../utils/DomUtils';
import { CSS_CLASSES } from '../styles/cssclasses';

function createElevatorConfig(buildingIndex: number, elevatorIndex: number, settings: any) {
    const buildingConfig = settings.buildingConfigs?.[buildingIndex];
    const currentConfig = buildingConfig?.elevatorConfigs?.[elevatorIndex];
    const defaultConfig = settings.defaultElevatorConfig;

    // If no config exists, use the default config
    const config = currentConfig || { ...defaultConfig };

    return `
        <div class="elevator-config" data-building-index="${buildingIndex}" data-elevator-index="${elevatorIndex}">
            <h4>Elevator ${elevatorIndex + 1}</h4>
            <label for="stopDelay-${buildingIndex}-${elevatorIndex}">Stop Delay (seconds)</label>
            <input type="number" id="stopDelay-${buildingIndex}-${elevatorIndex}" class="stop-delay" 
                value="${config.stopDelay}" min="1" max="10" step="0.5" 
                data-building-index="${buildingIndex}" data-elevator-index="${elevatorIndex}">
            
            <label for="floorPassingTime-${buildingIndex}-${elevatorIndex}">Floor Passing Time (seconds)</label>
            <input type="number" id="floorPassingTime-${buildingIndex}-${elevatorIndex}" class="floor-passing-time" 
                value="${config.floorPassingTime}" min="0.1" max="2" step="0.1" 
                data-building-index="${buildingIndex}" data-elevator-index="${elevatorIndex}">
        </div>
    `;
}

function createBuildingConfig(index: number, settings: any) {
    const buildingConfig = settings.buildingConfigs?.[index];
    const defaultConfig = settings.defaultBuildingConfig;

    // If no building config exists, use the default config
    const config = buildingConfig || {
        ...defaultConfig,
        elevatorConfigs: Array(defaultConfig.numberOfElevators)
            .fill(null)
            .map(() => ({ ...settings.defaultElevatorConfig }))
    };

    const elevatorConfigsHtml = Array(config.numberOfElevators || defaultConfig.numberOfElevators)
        .fill(0)
        .map((_, i) => createElevatorConfig(index, i, {
            ...settings,
            buildingConfigs: [config]
        }))
        .join('');

    return `
        <div class="building-config" data-building-index="${index}">
            <h3>Building ${index + 1} Configuration</h3>
            <label for="factoryType-${index}">Building Type</label>
            <select id="factoryType-${index}" class="building-type" data-building-index="${index}">
                <option value="standard" ${config.factoryType === 'standard' ? 'selected' : ''}>Standard Building</option>
                <option value="highrise" ${config.factoryType === 'highrise' ? 'selected' : ''}>High-Rise Building</option>
            </select>

            <label for="floorHeight-${index}">Floor Height (px)</label>
            <input type="number" id="floorHeight-${index}" class="floor-height" 
                value="${config.floorHeight}" min="50" max="200" 
                data-building-index="${index}">

            <label for="numberOfFloors-${index}">Number of Floors</label>
            <input type="number" id="numberOfFloors-${index}" class="floor-count" 
                value="${config.numberOfFloors}" min="2" max="20" 
                data-building-index="${index}">
            
            <label for="numberOfElevators-${index}">Number of Elevators</label>
            <input type="number" id="numberOfElevators-${index}" class="elevator-count" 
                value="${config.numberOfElevators}" min="1" max="4" 
                data-building-index="${index}">

            <div class="elevator-configs">
                ${elevatorConfigsHtml}
            </div>
        </div>
    `;
}

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

    // Create the base settings HTML
    let settingsHtml = `
        <h2 id="settings-title" tabindex="-1">Building Settings</h2>
        
        <div class="${CSS_CLASSES.SETTINGS_GROUP} number-of-buildings" role="form">
            <label for="numberOfBuildings">Number of Buildings</label>
            <input type="number" id="numberOfBuildings" value="${currentSettings.numberOfBuildings}" 
                min="1" max="4" aria-describedby="buildings-desc">
        </div>

        <div class="${CSS_CLASSES.SETTINGS_GROUP} global-defaults" role="form">
            <h3>Global Default Settings</h3>
            <div class="global-override-control">
                <label>
                    <input type="checkbox" id="forceOverride">
                    Force override all settings (ignore existing values)
                </label>
                <p class="help-text">When checked, changes to global settings will override all building and elevator settings, even if they were previously customized.</p>
            </div>
            
            <div class="building-defaults">
                <h4>Building Defaults</h4>
                <label for="defaultFactoryType">Default Building Type</label>
                <select id="defaultFactoryType">
                    <option value="standard" ${currentSettings.defaultBuildingConfig.factoryType === 'standard' ? 'selected' : ''}>Standard Building</option>
                    <option value="highrise" ${currentSettings.defaultBuildingConfig.factoryType === 'highrise' ? 'selected' : ''}>High-Rise Building</option>
                </select>

                <label for="defaultFloorHeight">Default Floor Height (px)</label>
                <input type="number" id="defaultFloorHeight" 
                    value="${currentSettings.defaultBuildingConfig.floorHeight}" 
                    min="50" max="200">

                <label for="defaultNumberOfFloors">Default Number of Floors</label>
                <input type="number" id="defaultNumberOfFloors" 
                    value="${currentSettings.defaultBuildingConfig.numberOfFloors}" 
                    min="2" max="20">

                <label for="defaultNumberOfElevators">Default Number of Elevators</label>
                <input type="number" id="defaultNumberOfElevators" 
                    value="${currentSettings.defaultBuildingConfig.numberOfElevators}" 
                    min="1" max="4">
            </div>

            <div class="elevator-defaults">
                <h4>Elevator Defaults</h4>
                <label for="defaultStopDelay">Default Stop Delay (seconds)</label>
                <input type="number" id="defaultStopDelay" 
                    value="${currentSettings.defaultElevatorConfig.stopDelay}" 
                    min="1" max="10" step="0.5">

                <label for="defaultFloorPassingTime">Default Floor Passing Time (seconds)</label>
                <input type="number" id="defaultFloorPassingTime" 
                    value="${currentSettings.defaultElevatorConfig.floorPassingTime}" 
                    min="0.1" max="2" step="0.1">
            </div>
        </div>

        <div class="${CSS_CLASSES.SETTINGS_GROUP} specific-settings" role="form">
            <h3>Building-Specific Settings</h3>
            <div id="buildingConfigs">
                ${Array(currentSettings.numberOfBuildings).fill(0).map((_, i) =>
        createBuildingConfig(i, currentSettings)).join('')}
            </div>
        </div>
        <button class="${CSS_CLASSES.APPLY_BUTTON}" aria-label="Apply Settings">Apply Settings</button>
    `;

    panel.innerHTML = settingsHtml;

    // Add event handler for number of buildings changes
    const buildingsInput = panel.querySelector('#numberOfBuildings') as HTMLInputElement;
    buildingsInput.addEventListener('change', () => {
        const count = parseInt(buildingsInput.value);
        const configsContainer = panel.querySelector('#buildingConfigs')!;

        // Get the current settings instead of using the initial settings
        const latestSettings = settingsManager.getSettings();
        configsContainer.innerHTML = Array(count).fill(0).map((_, i) =>
            createBuildingConfig(i, latestSettings)).join('');
    });

    // Add handlers for global default changes
    const globalDefaultsForm = panel.querySelector('.global-defaults') as HTMLElement;
    globalDefaultsForm.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement | HTMLSelectElement;
        if (!target) return;

        const newDefaults: any = {
            defaultBuildingConfig: { ...currentSettings.defaultBuildingConfig },
            defaultElevatorConfig: { ...currentSettings.defaultElevatorConfig }
        };

        // Don't process the force override checkbox changes
        if (target.id === 'forceOverride') return;

        // Update the appropriate default setting
        switch (target.id) {
            case 'defaultFactoryType':
                newDefaults.defaultBuildingConfig.factoryType = target.value;
                break;
            case 'defaultFloorHeight':
                newDefaults.defaultBuildingConfig.floorHeight = Number(target.value);
                break;
            case 'defaultNumberOfFloors':
                newDefaults.defaultBuildingConfig.numberOfFloors = Number(target.value);
                break;
            case 'defaultNumberOfElevators':
                newDefaults.defaultBuildingConfig.numberOfElevators = Number(target.value);
                break;
            case 'defaultStopDelay':
                newDefaults.defaultElevatorConfig.stopDelay = Number(target.value);
                break;
            case 'defaultFloorPassingTime':
                newDefaults.defaultElevatorConfig.floorPassingTime = Number(target.value);
                break;
        }

        const forceOverride = (panel.querySelector('#forceOverride') as HTMLInputElement).checked;
        settingsManager.updateGlobalDefaults(newDefaults, forceOverride);
    });

    // Add handlers for building-specific settings
    const buildingConfigsContainer = panel.querySelector('#buildingConfigs') as HTMLElement;
    buildingConfigsContainer.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement | HTMLSelectElement;
        if (!target) return;

        const buildingConfig = target.closest('.building-config');
        const elevatorConfig = target.closest('.elevator-config');

        if (buildingConfig) {
            const buildingIndex = parseInt(buildingConfig.getAttribute('data-building-index')!);

            if (elevatorConfig) {
                // Handle elevator-specific setting changes
                const elevatorIndex = parseInt(elevatorConfig.getAttribute('data-elevator-index')!);
                const config = {
                    [target.classList.contains('stop-delay') ? 'stopDelay' : 'floorPassingTime']: Number(target.value)
                };
                settingsManager.updateElevatorConfig(buildingIndex, elevatorIndex, config);
            } else {
                // Handle building-specific setting changes
                const config: any = {};
                switch (target.classList[0]) {
                    case 'building-type':
                        config.factoryType = target.value;
                        break;
                    case 'floor-height':
                        config.floorHeight = Number(target.value);
                        break;
                    case 'floor-count':
                        config.numberOfFloors = Number(target.value);
                        break;
                    case 'elevator-count':
                        config.numberOfElevators = Number(target.value);
                        // Refresh elevator configs section
                        const elevatorsContainer = buildingConfig.querySelector('.elevator-configs')!;
                        elevatorsContainer.innerHTML = Array(config.numberOfElevators).fill(0)
                            .map((_, i) => createElevatorConfig(buildingIndex, i, settingsManager.getSettings()))
                            .join('');
                        break;
                }
                settingsManager.updateBuildingConfig(buildingIndex, config);
            }
        }
    });

    // Add event handlers for panel visibility
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
                // Final settings update
                const newDefaults: any = {
                    numberOfBuildings: Number(buildingsInput.value)
                };
                settingsManager.updateGlobalDefaults(newDefaults);
                onApply();
                overlay.click();
            };
        }
    };
}