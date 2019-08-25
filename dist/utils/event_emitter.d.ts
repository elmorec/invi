export declare class EventEmitter {
    private _events;
    /**
     * Register an event handler for the given type.
     *
     * @param type Type of event to listen for, or `"*"` for all events
     * @param handler Function to call in response to given event
     */
    on(type: string, handler: (event?: any) => void): void;
    /**
     * Remove an event handler for the given type.
     *
     * @param type Type of event to unregister `handler` from, or `"*"`
     * @param handler Handler function to remove
     */
    off(type: string, handler: (event?: any) => void): void;
    /** @ignore */
    protected removeAllListeners(): void;
    /**
     * Invoke all handlers for the given type.
     * If present, `"*"` handlers are invoked after type-matched handlers.
     *
     * @param type The event type to invoke
     * @param evt Any value (object is recommended and powerful), passed to each handler
     * @ignore
     */
    protected emit<T, U = void>(type: string, ...data: [T?, U?]): void;
}
