import { Building } from './core/building.js';
import { BuildingFactory } from './core/buildingFactory.js';
import { DomUtils } from './utils/DomUtils.js';
import { createSettingsPanel } from './components/settingsPanel.js';
import { createStyles } from './styles.js';
import { CSS_CLASSES } from './constants/styles.js';
import { BuildingEvents } from './types/BuildingEvents.js';
import { Floor } from './core/floor.js';

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
    button.classList.toggle(CSS_CLASSES.PRESSED, floor.isButtonPressed);
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

        const buildingContainer = DomUtils.createElement('div', 'building-container');
        const buildingTitle = DomUtils.createElement('h2', 'building-title');
        buildingTitle.textContent = `Building ${buildingIndex + 1}`;
        buildingContainer.appendChild(buildingTitle);

        const buildingWrapper = DomUtils.createElement('div', 'building-wrapper');
        const buildingDiv = DomUtils.createElement('div', CSS_CLASSES.BUILDING, {
            'data-building-id': buildingIndex.toString()
        });

        const totalHeight = (settings.floorHeight * settings.numberOfFloors) + (settings.numberOfFloors - 1);
        DomUtils.setStyles(buildingDiv, { height: `${totalHeight}px` });

        const elevatorContainer = DomUtils.createElement('div', 'elevator-container');
        DomUtils.setStyles(elevatorContainer, { height: `${totalHeight}px` });

        const floorsToDisplay = [...building.getFloors()].reverse();

        floorsToDisplay.forEach((floor, displayIndex) => {
            const floorDiv = DomUtils.createElement('div', CSS_CLASSES.FLOOR);
            const floorInfo = DomUtils.createElement('span', 'floor-number');
            const floorNumber = DomUtils.createElement('span');
            floorNumber.textContent = `Floor ${floor.number}`;
            const countdown = DomUtils.createElement('span', 'countdown');

            floorDiv.dataset.displayIndex = displayIndex.toString();
            floorDiv.dataset.floorNumber = floor.number.toString();

            floor.on(BuildingEvents.COUNTDOWN_CHANGED, (data) => {
                if (countdown) {
                    countdown.textContent = data.timeLeft > 0 ? `(${data.timeLeft.toFixed(1)}s)` : '';
                }
            });

            floorInfo.append(floorNumber, countdown);

            const button = DomUtils.createElement('button', CSS_CLASSES.BUTTON);
            button.textContent = `${floor.number}`;
            button.disabled = floor.shouldButtonBeDisabled;
            button.onclick = () => {
                button.disabled = true;
                button.classList.add(CSS_CLASSES.PRESSED);
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
    });

    appDiv.append(overlay, settingsToggle, container, panel);
}

/**
 * Initializes the elevator simulation
 * Creates styles, building instance, and sets up the UI
 */
function init() {
    createStyles();
    reinitializeBuilding();
}

// Start the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);