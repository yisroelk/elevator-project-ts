import { Building } from './building.js';
import { BuildingFactory } from './buildingFactory.js';
import { Elevator } from './elevator.js';

/**
 * Creates and injects CSS styles for the elevator simulation
 * Defines styles for building, floors, elevators, and buttons
 */
function createStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .building {
            position: relative;
            border: 2px solid #333;
            margin: 20px;
            height: 1020px; /* Accommodates 10 floors of 100px + borders */
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
        }
    `;
    document.head.appendChild(style);
}

/**
 * Creates and sets up the user interface for the elevator simulation
 * @param building - The building instance to create UI for
 */
function createUI(building: Building) {
    const appDiv = document.getElementById('app');
    if (!appDiv) return;

    // Clear existing content
    appDiv.innerHTML = '';

    // Create building container
    const buildingDiv = document.createElement('div');
    buildingDiv.className = 'building';

    // Create floors (in reverse order so ground floor is at bottom)
    const floors = building.getFloors();
    for (let i = floors.length - 1; i >= 0; i--) {
        const floor = floors[i];
        const floorDiv = document.createElement('div');
        floorDiv.className = 'floor';

        // Create floor number display
        const floorNumber = document.createElement('span');
        floorNumber.className = 'floor-number';
        floorNumber.textContent = `Floor ${floor.number}`;

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

        floorDiv.appendChild(floorNumber);
        floorDiv.appendChild(button);
        buildingDiv.appendChild(floorDiv);
    }

    // Add elevator elements to the UI
    const elevators = building.getElevators();
    elevators.forEach((elevator: Elevator, index: number) => {
        elevator.element.style.left = `${50 + (index * 80)}px`;
        buildingDiv.appendChild(elevator.element);
    });

    appDiv.appendChild(buildingDiv);

    // Set up elevator arrival handler
    building.onElevatorArrival = (floor: number) => {
        const floorObj = floors.find(f => f.number === floor);
        if (!floorObj) {
            console.error(`Floor ${floor} not found`);
            return;
        }

        // Find and update the floor's button
        const floorButton = buildingDiv.querySelector(
            `div.floor:nth-child(${floors.length - floor}) button.floor-button`
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
            `div.floor:nth-child(${floors.length - floor}) button.floor-button`
        ) as HTMLButtonElement | null;

        if (!floorButton) {
            console.error(`Button for floor ${floor} not found`);
            return;
        }

        // Update button state when elevator departs
        floorButton.disabled = floorObj.shouldButtonBeDisabled;
    };
}

/**
 * Initializes the elevator simulation
 * Creates styles, building instance, and sets up the UI
 */
function init() {
    createStyles();

    // Create building with default settings
    const factory = new BuildingFactory();
    const building = factory.createBuilding();

    createUI(building);
}

// Start the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);