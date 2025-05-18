import { Floor } from '../core/floor';
import { Building } from '../core/building';
import { DomUtils } from '../utils/DomUtils';
import { CSS_CLASSES } from '../styles/cssclasses';
import { BuildingEvents } from '../types/BuildingEvents';

export class FloorComponent {
    private floorElement: HTMLElement;
    private button!: HTMLButtonElement; // Use definite assignment assertion
    private countdown!: HTMLElement; // Use definite assignment assertion

    constructor(
        private floor: Floor,
        private displayIndex: number,
        private building: Building
    ) {
        this.floorElement = this.createFloorElement();
    }

    private createFloorElement(): HTMLElement {
        const floorDiv = DomUtils.createElement('div', CSS_CLASSES.FLOOR);
        const floorInfo = DomUtils.createElement('span', CSS_CLASSES.FLOOR_NUMBER);
        this.countdown = DomUtils.createElement('span', CSS_CLASSES.COUNTDOWN);

        floorDiv.dataset.displayIndex = this.displayIndex.toString();
        floorDiv.dataset.floorNumber = this.floor.number.toString();

        this.floor.on(BuildingEvents.COUNTDOWN_CHANGED, (data) => {
            this.countdown.textContent = data.timeLeft > 0 ? `${data.timeLeft.toFixed(1)}` : '';
        });

        floorInfo.append(this.countdown);

        this.button = this.createFloorButton();
        floorDiv.append(floorInfo, this.button);

        return floorDiv;
    }

    private createFloorButton(): HTMLButtonElement {
        const button = DomUtils.createElement('button', `${CSS_CLASSES.BUTTON} metal linear`);
        button.textContent = `${this.floor.number}`;
        button.disabled = this.floor.shouldButtonBeDisabled;

        button.onclick = () => {
            button.disabled = true;
            button.classList.add('active');
            this.building.requestElevator(this.floor.number);
        };

        return button;
    }

    update(floor: Floor): void {
        this.button.disabled = floor.shouldButtonBeDisabled;
        this.button.classList.toggle('active', floor.isButtonPressed);
    }

    getElement(): HTMLElement {
        return this.floorElement;
    }

    getFloorNumber(): number {
        return this.floor.number;
    }
}