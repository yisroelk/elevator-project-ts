type EventMap = Record<string, any>;

export class EventEmitter<Events extends EventMap = EventMap> {
    private events: {
        [K in keyof Events]?: Array<(payload: Events[K]) => void>;
    } = {};

    on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event]!.push(handler);
    }

    emit<K extends keyof Events>(event: K, payload: Events[K]): void {
        const handlers = this.events[event];
        if (handlers) {
            handlers.forEach(handler => handler(payload));
        }
    }

    off<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void {
        const handlers = this.events[event];
        if (handlers) {
            this.events[event] = handlers.filter(h => h !== handler);
        }
    }
}