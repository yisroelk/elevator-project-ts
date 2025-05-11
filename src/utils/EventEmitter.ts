type EventHandler = (...args: any[]) => void;

export class EventEmitter {
    private events: { [key: string]: EventHandler[] } = {};

    on(event: string, handler: EventHandler) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(handler);
    }

    emit(event: string, ...args: any[]) {
        const handlers = this.events[event];
        if (handlers) {
            handlers.forEach(handler => handler(...args));
        }
    }

    off(event: string, handler: EventHandler) {
        const handlers = this.events[event];
        if (handlers) {
            this.events[event] = handlers.filter(h => h !== handler);
        }
    }
}