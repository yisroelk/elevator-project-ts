import { Building } from './core/building';
import { BuildingFactory } from './core/buildingFactory';
import { HighRiseBuildingFactory } from './core/highRiseBuildingFactory';
import { BuildingFactoryBase } from './core/abstractBuildingFactory';
import { createSettingsPanel } from './components/settingsPanel';
import { SettingsManager } from './core/SettingsManager';
import { BuildingComponent } from './components/BuildingComponent';
import './styles/styles.css';

/**
 * Gets the appropriate factory based on settings
 */
function getFactory(factoryType: 'standard' | 'highrise'): BuildingFactoryBase {
    return factoryType === 'highrise' ?
        new HighRiseBuildingFactory() :
        new BuildingFactory();
}

/**
 * Reinitializes all buildings with current settings
 */
function reinitializeBuilding() {
    try {
        console.log('Creating buildings...');
        const settings = SettingsManager.getInstance().getSettings();
        const factory = getFactory(settings.defaultBuildingConfig.factoryType);
        const buildings = factory.createBuildings();
        console.log('Creating UI...');
        createUI(buildings);
        console.log('UI creation complete');
    } catch (error) {
        console.error('Error in reinitializeBuilding:', error);
    }
}

/**
 * Creates and sets up the user interface for the elevator simulation
 * @param buildings - Array of building instances to create UI for
 */
function createUI(buildings: Building[]) {
    const appDiv = document.getElementById('app');
    if (!appDiv) return;

    appDiv.innerHTML = '';

    const { panel, overlay, settingsToggle, setupApplyButton } = createSettingsPanel();
    setupApplyButton(reinitializeBuilding);

    const container = document.createElement('div');
    container.className = 'container';

    // Create building components
    buildings.forEach((building, index) => {
        const buildingComponent = new BuildingComponent(building, index);
        container.appendChild(buildingComponent.getElement());
    });

    appDiv.append(overlay, settingsToggle, container, panel);

    // Scroll to the bottom of the page after elements are added
    window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'auto'
    });
}

/**
 * Initializes the elevator simulation
 */
function init() {
    try {
        console.log('Initializing elevator simulation...');
        reinitializeBuilding();
        console.log('Initialization complete');
    } catch (error) {
        console.error('Failed to initialize:', error);
    }
}

// Start the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);