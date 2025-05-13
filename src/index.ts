import { Building } from './core/building';
import { BuildingFactory } from './core/buildingFactory';
import { DomUtils } from './utils/DomUtils';
import { createSettingsPanel } from './components/settingsPanel';
import './styles/styles.css';
import './styles/help.css';
import './styles/main.css';
import { CSS_CLASSES } from './styles/classes';
import { BuildingEvents } from './types/BuildingEvents';
import { Floor } from './core/floor';

/**
 * Reinitializes all buildings with current settings
 */
function reinitializeBuilding() {
    const factory = new BuildingFactory();
    const buildings = factory.createBuildings();
    createUI(buildings);
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
        // Set the floor height CSS variable
        document.documentElement.style.setProperty('--floor-height', `${settings.floorHeight}px`);

        const buildingContainer = DomUtils.createElement('div', CSS_CLASSES.BUILDING_CONTAINER);
        const buildingTitle = DomUtils.createElement('h2', CSS_CLASSES.BUILDING_TITLE);
        buildingTitle.textContent = `Building ${buildingIndex + 1}`;
        buildingContainer.appendChild(buildingTitle);

        const buildingWrapper = DomUtils.createElement('div', CSS_CLASSES.BUILDING_WRAPPER);
        const buildingDiv = DomUtils.createElement('div', CSS_CLASSES.BUILDING, {
            'data-building-id': buildingIndex.toString()
        });

        // Calculate total height (110px per floor)
        const totalHeight = settings.floorHeight * settings.numberOfFloors;
        DomUtils.setStyles(buildingDiv, { height: `${totalHeight}px` });

        const elevatorContainer = DomUtils.createElement('div', CSS_CLASSES.ELEVATOR_CONTAINER);
        DomUtils.setStyles(elevatorContainer, { height: `${totalHeight}px` });

        const floorsToDisplay = [...building.getFloors()].reverse();

        floorsToDisplay.forEach((floor, displayIndex) => {
            const floorDiv = DomUtils.createElement('div', CSS_CLASSES.FLOOR);
            const floorInfo = DomUtils.createElement('span', CSS_CLASSES.FLOOR_NUMBER);
            const countdown = DomUtils.createElement('span', CSS_CLASSES.COUNTDOWN);

            floorDiv.dataset.displayIndex = displayIndex.toString();
            floorDiv.dataset.floorNumber = floor.number.toString();

            floor.on(BuildingEvents.COUNTDOWN_CHANGED, (data) => {
                if (countdown) {
                    countdown.textContent = data.timeLeft > 0 ? `(${data.timeLeft.toFixed(1)}s)` : '';
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

        building.getElevators().forEach((elevator, index) => {
            DomUtils.setStyles(elevator.element, { left: `${index * 70}px` });
            elevatorContainer.appendChild(elevator.element);
        });

        buildingWrapper.append(buildingDiv, elevatorContainer);
        buildingContainer.appendChild(buildingWrapper);
        container.appendChild(buildingContainer);

        // Subscribe to building events for UI updates
        building.on(BuildingEvents.FLOOR_UPDATED, (data) => {
            // Handle both Floor object and resetButton event types
            const floorNumber = 'type' in data ? data.floor : data.number;
            const floorDiv = buildingDiv.querySelector(
                `div.floor[data-floor-number="${floorNumber}"]`
            );
            if (floorDiv && !('type' in data)) {
                updateFloorUI(floorDiv as HTMLElement, data);
            }
        });

        building.on(BuildingEvents.ELEVATOR_REQUESTED, (data) => {
            const floor = building.getFloors()[data.floor];
            if (!floor) return;
            floor.pressButton();
            floor.startCountdown(data.estimatedTime);
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
    reinitializeBuilding();
}

// Start the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);