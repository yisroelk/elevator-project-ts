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

        // Calculate total height
        const totalHeight = settings.floorHeight * settings.numberOfFloors;
        DomUtils.setStyles(buildingDiv, { height: `${totalHeight}px` });

        const elevatorContainer = DomUtils.createElement('div', CSS_CLASSES.ELEVATOR_CONTAINER);
        DomUtils.setStyles(elevatorContainer, { height: `${totalHeight}px`, width : `${settings.numberOfElevators * 70}px` });

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

        const elevatorToDisplay = [...building.getElevators()];

        elevatorToDisplay.forEach((elevator, displayIndex) => {
            const elevatorDiv = DomUtils.createElement('div', CSS_CLASSES.ELEVATOR);
            DomUtils.setStyles(elevatorDiv, { left: `${displayIndex * 70}px` });
            elevatorDiv.dataset.index = displayIndex.toString();
            elevatorDiv.dataset.elevatorNumber = elevator.id.toString();
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
            console.log('§§§§§§§§ Elevator requested:', data);
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
            updateElevatorPosition(elevatorDiv as HTMLElement, data.position, settings.floorHeight);
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