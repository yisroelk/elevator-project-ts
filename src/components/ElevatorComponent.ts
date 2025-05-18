import { Elevator } from '../core/elevator';
import { DomUtils } from '../utils/DomUtils';
import { CSS_CLASSES } from '../styles/cssclasses';

export class ElevatorComponent {
    private elevatorElement: HTMLElement;

    constructor(
        private elevator: Elevator,
        private displayIndex: number,
        private buildingIndex: number,
        private isHighRise: boolean
    ) {
        this.elevatorElement = this.createElevatorElement();
    }

    private createElevatorElement(): HTMLElement {
        const elevatorDiv = DomUtils.createElement('div', CSS_CLASSES.ELEVATOR);
        DomUtils.setStyles(elevatorDiv, { left: `${this.displayIndex * 70}px` });
        elevatorDiv.dataset.index = this.displayIndex.toString();
        elevatorDiv.dataset.elevatorNumber = this.elevator.id.toString();

        // Add elevator info icon with tooltip
        const infoIcon = DomUtils.createElement('span', 'info-icon');
        infoIcon.textContent = 'i';
        const tooltip = DomUtils.createElement('div', 'tooltip');

        const tooltipTitle = DomUtils.createElement('div', 'tooltip-title');
        tooltipTitle.textContent = `Elevator ${this.displayIndex + 1}`;

        const elevatorConfig = this.elevator.getElevatorConfig();
        const tooltipContent = [
            ['Type', this.isHighRise ? 'Express' : 'Standard'],
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

        tooltip.appendChild(tooltipTitle);
        tooltipContent.forEach(row => tooltip.appendChild(row));
        infoIcon.appendChild(tooltip);
        elevatorDiv.appendChild(infoIcon);

        return elevatorDiv;
    }

    updatePosition(position: number): void {
        const visualPosition = position * this.getFloorHeight();
        this.elevatorElement.style.transform = `translateY(-${visualPosition}px)`;
    }

    private getFloorHeight(): number {
        const style = getComputedStyle(document.documentElement);
        return parseInt(style.getPropertyValue(`--floor-height-building-${this.buildingIndex}`)) || 110;
    }

    getElement(): HTMLElement {
        return this.elevatorElement;
    }

    getElevatorId(): number {
        return this.elevator.id;
    }
}