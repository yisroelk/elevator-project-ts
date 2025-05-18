// Type alias for the event map - allows any key-value pairs
type EventMap = Record<string, any>;

/**
 * Generic event emitter class that implements the observer pattern
 * Allows components to subscribe to and emit typed events
 */
export class EventEmitter<Events extends EventMap = EventMap> {
    // Store event handlers mapped to their event names
    private events: {
        [K in keyof Events]?: Array<(payload: Events[K]) => void>;
    } = {};

    /**
     * Subscribe to an event
     * @param event - The event name to listen for
     * @param handler - Callback function to execute when event occurs
     */
    on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void {
        // Initialize handler array if this is first subscription
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event]!.push(handler);
    }

    /**
     * Emit an event with payload data
     * @param event - The event name to emit
     * @param payload - Data to pass to event handlers
     */
    emit<K extends keyof Events>(event: K, payload: Events[K]): void {
        const handlers = this.events[event];
        if (handlers) {
            // Execute all handlers with the provided payload
            handlers.forEach(handler => handler(payload));
        }
    }

    /**
     * Unsubscribe from an event
     * @param event - The event name to unsubscribe from
     * @param handler - The specific handler to remove
     */
    off<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void {
        const handlers = this.events[event];
        if (handlers) {
            // Filter out the specified handler
            this.events[event] = handlers.filter(h => h !== handler);
        }
    }
}