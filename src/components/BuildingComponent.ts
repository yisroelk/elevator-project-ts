import { Building } from '../core/building';
import { DomUtils } from '../utils/DomUtils';
import { CSS_CLASSES } from '../styles/cssclasses';
import { BuildingEvents } from '../types/BuildingEvents';
import { FloorComponent } from './FloorComponent';
import { ElevatorComponent } from './ElevatorComponent';
import { BuildingSettings } from '../types/BuildingSettings';

export class BuildingComponent {
    private buildingContainer: HTMLElement;
    private buildingDiv!: HTMLElement; // Use definite assignment assertion
    private elevatorContainer!: HTMLElement; // Use definite assignment assertion
    private floorComponents: FloorComponent[] = [];
    private elevatorComponents: ElevatorComponent[] = [];

    constructor(private building: Building, private buildingIndex: number) {
        this.buildingContainer = this.createBuildingContainer();
    }

    private createBuildingContainer(): HTMLElement {
        const settings = this.building.getSettings();
        const buildingConfig = settings.buildingConfigs?.[this.buildingIndex];
        const floorHeight = buildingConfig?.floorHeight || settings.defaultBuildingConfig.floorHeight;

        document.documentElement.style.setProperty(
            `--floor-height-building-${this.buildingIndex}`,
            `${floorHeight}px`
        );

        const container = DomUtils.createElement('div', CSS_CLASSES.BUILDING_CONTAINER);
        const title = this.createBuildingTitle(settings, buildingConfig);
        container.appendChild(title);

        const wrapper = DomUtils.createElement('div', CSS_CLASSES.BUILDING_WRAPPER);
        this.buildingDiv = this.createBuildingDiv(settings, floorHeight);
        this.elevatorContainer = this.createElevatorContainer(settings, floorHeight);

        wrapper.append(this.buildingDiv, this.elevatorContainer);
        container.appendChild(wrapper);

        this.setupEventListeners();

        return container;
    }

    private createBuildingTitle(settings: BuildingSettings, buildingConfig: any): HTMLElement {
        const title = DomUtils.createElement('h2', CSS_CLASSES.BUILDING_TITLE);
        const titleText = document.createTextNode(`Building ${this.buildingIndex + 1}`);
        title.appendChild(titleText);

        const infoIcon = DomUtils.createElement('span', 'info-icon');
        infoIcon.textContent = 'i';
        const tooltip = DomUtils.createElement('div', 'tooltip');

        const tooltipTitle = DomUtils.createElement('div', 'tooltip-title');
        tooltipTitle.textContent = `Building ${this.buildingIndex + 1}`;

        const buildingContent = [
            ['Type', buildingConfig?.factoryType || 'standard'],
            ['Number of Floors', String(buildingConfig?.numberOfFloors || settings.defaultBuildingConfig.numberOfFloors)],
            ['Number of Elevators', String(buildingConfig?.numberOfElevators || settings.defaultBuildingConfig.numberOfElevators)],
            ['Floor Height', `${buildingConfig?.floorHeight || settings.defaultBuildingConfig.floorHeight}px`]
        ].map(([label, value]) => {
            const row = DomUtils.createElement('div', 'tooltip-row');
            const labelSpan = DomUtils.createElement('span', 'tooltip-label');
            const valueSpan = DomUtils.createElement('span', 'tooltip-value');
            labelSpan.textContent = String(label);
            valueSpan.textContent = String(value);
            row.append(labelSpan, valueSpan);
            return row;
        });

        tooltip.appendChild(tooltipTitle);
        buildingContent.forEach(row => tooltip.appendChild(row));
        infoIcon.appendChild(tooltip);
        title.appendChild(infoIcon);

        return title;
    }

    private createBuildingDiv(settings: BuildingSettings, floorHeight: number): HTMLElement {
        const buildingDiv = DomUtils.createElement('div',
            `${CSS_CLASSES.BUILDING} building-${this.buildingIndex}`,
            { 'data-building-id': this.buildingIndex.toString() }
        );

        const totalHeight = floorHeight * settings.defaultBuildingConfig.numberOfFloors;
        DomUtils.setStyles(buildingDiv, { height: `${totalHeight}px` });

        const floors = [...this.building.getFloors()].reverse();
        floors.forEach((floor, displayIndex) => {
            const floorComponent = new FloorComponent(floor, displayIndex, this.building);
            this.floorComponents.push(floorComponent);
            buildingDiv.appendChild(floorComponent.getElement());
        });

        return buildingDiv;
    }

    private createElevatorContainer(settings: BuildingSettings, floorHeight: number): HTMLElement {
        const container = DomUtils.createElement('div', CSS_CLASSES.ELEVATOR_CONTAINER);
        const totalHeight = floorHeight * settings.defaultBuildingConfig.numberOfFloors;

        DomUtils.setStyles(container, {
            height: `${totalHeight}px`,
            width: `${settings.defaultBuildingConfig.numberOfElevators * 70}px`
        });

        const elevators = [...this.building.getElevators()];
        elevators.forEach((elevator, index) => {
            const elevatorComponent = new ElevatorComponent(
                elevator,
                index,
                this.buildingIndex,
                settings.buildingConfigs?.[this.buildingIndex]?.factoryType === 'highrise'
            );
            this.elevatorComponents.push(elevatorComponent);
            container.appendChild(elevatorComponent.getElement());
        });

        return container;
    }

    private setupEventListeners(): void {
        this.building.on(BuildingEvents.FLOOR_UPDATED, (floor) => {
            const floorComponent = this.floorComponents.find(
                comp => comp.getFloorNumber() === floor.number
            );
            floorComponent?.update(floor);
        });

        this.building.on(BuildingEvents.ELEVATOR_POSITION_CHANGED, (data) => {
            const elevatorComponent = this.elevatorComponents.find(
                comp => comp.getElevatorId() === data.elevator
            );
            elevatorComponent?.updatePosition(data.position);
        });

        this.building.on(BuildingEvents.ELEVATOR_REQUESTED, (data) => {
            const floor = this.building.getFloors()[data.floor];
            if (!floor) return;
            floor.pressButton();
            floor.startCountdown(data.estimatedTime);
        });
    }

    getElement(): HTMLElement {
        return this.buildingContainer;
    }
}