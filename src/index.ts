import { Building } from './core/building';
import { BuildingFactory } from './core/buildingFactory';
import { HighRiseBuildingFactory } from './core/highRiseBuildingFactory';
import { BuildingFactoryBase } from './core/abstractBuildingFactory';
import { DomUtils } from './utils/DomUtils';
import { createSettingsPanel } from './components/settingsPanel';
import { SettingsManager } from './core/SettingsManager';
import './styles/styles.css';
import './styles/help.css';
import './styles/main.css';
import { CSS_CLASSES } from './styles/classes';
import { BuildingEvents } from './types/BuildingEvents';
import { Floor } from './core/floor';

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

function updateFloorUI(floorDiv: HTMLElement, floor: Floor) {
    const button = floorDiv.querySelector(
        `button.${CSS_CLASSES.BUTTON}`
    ) as HTMLButtonElement;
    if (!button) return;

    button.disabled = floor.shouldButtonBeDisabled;
    button.classList.toggle('active', floor.isButtonPressed);
}

/**
 * Updates the visual position of the elevator
 */
function updateElevatorPosition(elevator: HTMLElement, position: number, floorHeight: number) {
    const visualPosition = position * floorHeight;
    elevator.style.transform = `translateY(-${visualPosition}px)`;
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

    const container = DomUtils.createElement('div', CSS_CLASSES.CONTAINER);

    buildings.forEach((building, buildingIndex) => {
        const settings = building.getSettings();
        const buildingConfig = settings.buildingConfigs?.[buildingIndex];

        // Use building-specific floor height or default
        const floorHeight = buildingConfig?.floorHeight || settings.defaultBuildingConfig.floorHeight;
        document.documentElement.style.setProperty(`--floor-height-building-${buildingIndex}`, `${floorHeight}px`);

        const buildingContainer = DomUtils.createElement('div', CSS_CLASSES.BUILDING_CONTAINER);
        const buildingTitle = DomUtils.createElement('h2', CSS_CLASSES.BUILDING_TITLE);

        // Create title container to hold both text and info icon
        const titleText = document.createTextNode(`Building ${buildingIndex + 1}`);
        buildingTitle.appendChild(titleText);

        // Add building info icon with new tooltip structure
        const buildingInfoIcon = DomUtils.createElement('span', 'info-icon');
        buildingInfoIcon.textContent = 'i';
        const buildingTooltip = DomUtils.createElement('div', 'tooltip');

        const buildingTitleDiv = DomUtils.createElement('div', 'tooltip-title');
        buildingTitleDiv.textContent = `Building ${buildingIndex + 1}`;

        const buildingContent = [
            ['Type', buildingConfig?.factoryType || 'standard'],
            ['Number of Floors', String(buildingConfig?.numberOfFloors || settings.defaultBuildingConfig.numberOfFloors)],
            ['Number of Elevators', String(buildingConfig?.numberOfElevators || settings.defaultBuildingConfig.numberOfElevators)],
            ['Floor Height', `${floorHeight}px`]
        ].map(([label, value]) => {
            const row = DomUtils.createElement('div', 'tooltip-row');
            const labelSpan = DomUtils.createElement('span', 'tooltip-label');
            const valueSpan = DomUtils.createElement('span', 'tooltip-value');
            labelSpan.textContent = String(label);
            valueSpan.textContent = String(value);
            row.append(labelSpan, valueSpan);
            return row;
        });

        buildingTooltip.appendChild(buildingTitleDiv);
        buildingContent.forEach(row => buildingTooltip.appendChild(row));
        buildingInfoIcon.appendChild(buildingTooltip);
        buildingTitle.appendChild(buildingInfoIcon);

        buildingContainer.appendChild(buildingTitle);

        const buildingWrapper = DomUtils.createElement('div', CSS_CLASSES.BUILDING_WRAPPER);
        const buildingDiv = DomUtils.createElement('div', `${CSS_CLASSES.BUILDING} building-${buildingIndex}`, {
            'data-building-id': buildingIndex.toString()
        });

        // Calculate total height based on floor height
        const totalHeight = floorHeight * settings.defaultBuildingConfig.numberOfFloors;
        DomUtils.setStyles(buildingDiv, { height: `${totalHeight}px` });

        const elevatorContainer = DomUtils.createElement('div', CSS_CLASSES.ELEVATOR_CONTAINER);
        DomUtils.setStyles(elevatorContainer, {
            height: `${totalHeight}px`,
            width: `${settings.defaultBuildingConfig.numberOfElevators * 70}px` // 70px per elevator to prevent overlap
        });

        const floorsToDisplay = [...building.getFloors()].reverse();

        floorsToDisplay.forEach((floor, displayIndex) => {
            const floorDiv = DomUtils.createElement('div', CSS_CLASSES.FLOOR);
            const floorInfo = DomUtils.createElement('span', CSS_CLASSES.FLOOR_NUMBER);
            const countdown = DomUtils.createElement('span', CSS_CLASSES.COUNTDOWN);

            floorDiv.dataset.displayIndex = displayIndex.toString();
            floorDiv.dataset.floorNumber = floor.number.toString();

            floor.on(BuildingEvents.COUNTDOWN_CHANGED, (data) => {
                if (countdown) {
                    countdown.textContent = data.timeLeft > 0 ? `${data.timeLeft.toFixed(1)}` : '';
                }
            });

            floorInfo.append(countdown);

            const button = DomUtils.createElement('button', `${CSS_CLASSES.BUTTON} metal linear`);
            button.textContent = `${floor.number}`;
            button.disabled = floor.shouldButtonBeDisabled;
            button.onclick = () => {
                button.disabled = true;
                button.classList.add('active');
                building.requestElevator(floor.number);
            };

            floorDiv.append(floorInfo, button);
            buildingDiv.appendChild(floorDiv);
        });

        // Elevator creation with info icons
        const elevatorToDisplay = [...building.getElevators()];

        elevatorToDisplay.forEach((elevator, displayIndex) => {
            const elevatorDiv = DomUtils.createElement('div', CSS_CLASSES.ELEVATOR);
            DomUtils.setStyles(elevatorDiv, { left: `${displayIndex * 70}px` });
            elevatorDiv.dataset.index = displayIndex.toString();
            elevatorDiv.dataset.elevatorNumber = elevator.id.toString();

            // Add elevator info icon with new tooltip structure
            const elevatorInfoIcon = DomUtils.createElement('span', 'info-icon');
            elevatorInfoIcon.textContent = 'i';
            const elevatorTooltip = DomUtils.createElement('div', 'tooltip');

            const elevatorTitleDiv = DomUtils.createElement('div', 'tooltip-title');
            elevatorTitleDiv.textContent = `Elevator ${displayIndex + 1}`;

            const elevatorConfig = elevator.getElevatorConfig();
            const elevatorContent = [
                ['Type', buildingConfig?.factoryType === 'highrise' ? 'Express' : 'Standard'],
                ['Stop Delay', `${elevatorConfig.stopDelay}s`],
                ['Floor Passing Time', `${elevatorConfig.floorPassingTime}s`]
            ].map(([label, value]) => {
                const row = DomUtils.createElement('div', 'tooltip-row');
                const labelSpan = DomUtils.createElement('span', 'tooltip-label');
                const valueSpan = DomUtils.createElement('span', 'tooltip-value');
                labelSpan.textContent = label;
                valueSpan.textContent = String(value);
                row.append(labelSpan, valueSpan);
                return row;
            });

            elevatorTooltip.appendChild(elevatorTitleDiv);
            elevatorContent.forEach(row => elevatorTooltip.appendChild(row));
            elevatorInfoIcon.appendChild(elevatorTooltip);
            elevatorDiv.appendChild(elevatorInfoIcon);

            elevatorContainer.appendChild(elevatorDiv);
        });

        buildingWrapper.append(buildingDiv, elevatorContainer);
        buildingContainer.appendChild(buildingWrapper);
        container.appendChild(buildingContainer);

        // Subscribe to building events for UI updates
        building.on(BuildingEvents.FLOOR_UPDATED, (floor) => {
            const floorDiv = buildingDiv.querySelector(
                `div.floor[data-floor-number="${floor.number}"]`
            );
            if (floorDiv) {
                updateFloorUI(floorDiv as HTMLElement, floor);
            }
        });

        building.on(BuildingEvents.ELEVATOR_REQUESTED, (data) => {
            const floor = building.getFloors()[data.floor];
            if (!floor) return;
            floor.pressButton();
            floor.startCountdown(data.estimatedTime);
        });

        building.on(BuildingEvents.ELEVATOR_POSITION_CHANGED, (data) => {
            const elevatorDiv = elevatorContainer.querySelector(
                `div.elevator[data-elevator-number="${data.elevator}"]`
            );
            if (!elevatorDiv) return;

            updateElevatorPosition(elevatorDiv as HTMLElement, data.position, floorHeight);
        });
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
 * Creates styles, building instance, and sets up the UI
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