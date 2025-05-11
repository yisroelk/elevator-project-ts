import { Building } from './building.js';
import { BuildingFactory } from './buildingFactory.js';
import { Elevator } from './elevator.js';
import { SettingsManager } from './settings.js';

/**
 * Reinitializes all buildings with current settings
 */
function reinitializeBuilding() {
    const factory = new BuildingFactory();
    const buildings = factory.createBuildings();
    createUI(buildings);
}

/**
 * Creates and injects CSS styles for the elevator simulation
 * Defines styles for building, floors, elevators, and buttons
 */
function createStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .container {
            display: flex;
            gap: 40px;
            position: relative;
            flex-wrap: wrap;
            justify-content: center;
            padding: 20px;
        }
        
        .building-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 20px;
        }

        .building-title {
            text-align: center;
            padding: 5px;
            margin-bottom: 10px;
            font-size: 1.5em;
            font-weight: bold;
        }
        
        .building {
            position: relative;
            border: 2px solid #333;
            min-width: 300px;
            flex: 0 1 auto;
        }

        .floor {
            height: 100px;
            border-bottom: 1px solid #ccc;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
        }
        
        .elevator {
            position: absolute;
            left: 50px;
            bottom: 0;
            width: 60px;
            height: 90px;
            background-color: #666;
            border: 2px solid #333;
            transition: transform 1s linear;
        }
        
        .floor-button {
            padding: 5px 15px;
            background-color: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
        }
        
        .floor-button.pressed {
            background-color: #ff0000;
        }
        
        .floor-number {
            font-size: 18px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .countdown {
            font-size: 14px;
            color: #666;
            min-width: 80px;
        }

        .settings-panel {
            padding: 20px;
            background: #f5f5f5;
            border-radius: 5px;
            min-width: 300px;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
            display: none;
        }

        .settings-panel.visible {
            display: block;
        }

        .settings-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            z-index: 999;
        }

        .settings-toggle:hover {
            background-color: #45a049;
        }

        .settings-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: none;
            z-index: 999;
        }

        .settings-overlay.visible {
            display: block;
        }

        .settings-group {
            margin-bottom: 15px;
        }

        .settings-group label {
            display: block;
            margin-bottom: 5px;
        }

        .settings-group input {
            width: 100%;
            padding: 5px;
            margin-bottom: 10px;
        }

        .apply-button {
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        .apply-button:hover {
            background-color: #45a049;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Creates the settings panel UI
 * @returns HTMLElement containing the settings panel
 */
function createSettingsPanel(): HTMLElement {
    const settingsManager = SettingsManager.getInstance();
    const currentSettings = settingsManager.getSettings();

    const panel = document.createElement('div');
    panel.className = 'settings-panel';

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

    const applyButton = panel.querySelector('.apply-button') as HTMLButtonElement;
    applyButton.addEventListener('click', () => {
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
        reinitializeBuilding();
    });

    return panel;
}

/**
 * Creates and sets up the user interface for the elevator simulation
 * @param buildings - Array of building instances to create UI for
 */
function createUI(buildings: Building[]) {
    const appDiv = document.getElementById('app');
    if (!appDiv) return;

    // Clear existing content
    appDiv.innerHTML = '';

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'settings-overlay';

    // Create settings toggle button
    const settingsToggle = document.createElement('button');
    settingsToggle.className = 'settings-toggle';
    settingsToggle.textContent = 'Settings';

    // Create container for buildings and settings
    const container = document.createElement('div');
    container.className = 'container';

    // Create each building
    buildings.forEach((building, buildingIndex) => {
        const settings = building.getSettings();

        // Create building container that wraps both title and building
        const buildingContainer = document.createElement('div');
        buildingContainer.className = 'building-container';

        // Add building title outside the building
        const buildingTitle = document.createElement('h2');
        buildingTitle.textContent = `Building ${buildingIndex + 1}`;
        buildingTitle.className = 'building-title';
        buildingContainer.appendChild(buildingTitle);

        // Create building div
        const buildingDiv = document.createElement('div');
        buildingDiv.className = 'building';
        buildingDiv.dataset.buildingId = buildingIndex.toString();
        // Calculate height based on floors and borders
        const totalHeight = (settings.floorHeight * settings.numberOfFloors) + (settings.numberOfFloors - 1);
        buildingDiv.style.height = `${totalHeight}px`;

        // Create floors (in reverse order so ground floor is at bottom)
        const floors = building.getFloors();
        for (let i = floors.length - 1; i >= 0; i--) {
            const floor = floors[i];
            const floorDiv = document.createElement('div');
            floorDiv.className = 'floor';

            // Create floor info container
            const floorInfo = document.createElement('span');
            floorInfo.className = 'floor-number';

            // Create floor number display
            const floorNumber = document.createElement('span');
            floorNumber.textContent = `Floor ${floor.number}`;

            // Create countdown display
            const countdown = document.createElement('span');
            countdown.className = 'countdown';
            countdown.textContent = '';

            // Add event listener for countdown updates
            floor.on('countdown', (timeLeft: number) => {
                if (timeLeft > 0) {
                    countdown.textContent = `(${timeLeft.toFixed(1)}s)`;
                } else {
                    countdown.textContent = '';
                }
            });

            floorInfo.appendChild(floorNumber);
            floorInfo.appendChild(countdown);

            // Create and configure elevator call button
            const button = document.createElement('button');
            button.className = 'floor-button';
            button.textContent = 'Call Elevator';
            if (floor.isButtonPressed) {
                button.classList.add('pressed');
            }
            button.disabled = floor.shouldButtonBeDisabled;
            button.onclick = () => {
                button.classList.add('pressed');
                button.disabled = true;
                building.requestElevator(floor.number);
            };

            floorDiv.appendChild(floorInfo);
            floorDiv.appendChild(button);
            buildingDiv.appendChild(floorDiv);
        }

        // Add elevator elements to the UI
        const elevators = building.getElevators();
        elevators.forEach((elevator: Elevator, index: number) => {
            elevator.element.style.left = `${50 + (index * 80)}px`;
            buildingDiv.appendChild(elevator.element);
        });

        // Set up elevator arrival handler
        building.onElevatorArrival = (floor: number) => {
            const floorObj = floors.find(f => f.number === floor);
            if (!floorObj) {
                console.error(`Floor ${floor} not found`);
                return;
            }

            // Find and update the floor's button
            const floorButton = buildingDiv.querySelector(
                `div.floor:nth-child(${floors.length - floor + 1}) button.floor-button`
            ) as HTMLButtonElement | null;

            if (!floorButton) {
                console.error(`Button for floor ${floor} not found`);
                return;
            }

            // Update button state based on floor status
            if (!floorObj.isButtonPressed) {
                floorButton.classList.remove('pressed');
            }
            floorButton.disabled = floorObj.shouldButtonBeDisabled;
        };

        // Set up elevator departure handler
        building.onElevatorLeft = (floor: number) => {
            const floorObj = floors.find(f => f.number === floor);
            if (!floorObj) {
                console.error(`Floor ${floor} not found`);
                return;
            }

            // Find and update the floor's button
            const floorButton = buildingDiv.querySelector(
                `div.floor:nth-child(${floors.length - floor + 1}) button.floor-button`
            ) as HTMLButtonElement | null;

            if (!floorButton) {
                console.error(`Button for floor ${floor} not found`);
                return;
            }

            // Update button state when elevator departs
            floorButton.disabled = floorObj.shouldButtonBeDisabled;
        };

        buildingContainer.appendChild(buildingDiv);
        container.appendChild(buildingContainer);
    });

    // Create settings panel and add popup behavior
    const settingsPanel = createSettingsPanel();
    const applyButton = settingsPanel.querySelector('.apply-button') as HTMLButtonElement;

    // Update apply button click handler
    const oldClickHandler = applyButton.onclick;
    applyButton.onclick = (e) => {
        if (oldClickHandler) {
            oldClickHandler.call(applyButton, e);
        }
        settingsPanel.classList.remove('visible');
        overlay.classList.remove('visible');
    };

    // Add toggle button click handler
    settingsToggle.onclick = () => {
        settingsPanel.classList.toggle('visible');
        overlay.classList.toggle('visible');
    };

    // Add overlay click handler to close settings
    overlay.onclick = () => {
        settingsPanel.classList.remove('visible');
        overlay.classList.remove('visible');
    };

    // Add elements to the page
    appDiv.appendChild(overlay);
    appDiv.appendChild(settingsToggle);
    appDiv.appendChild(container);
    appDiv.appendChild(settingsPanel);
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