export class EventEmitter {
  private _events: { [type: string]: Function[] } = {};

  /**
   * Register an event handler for the given type.
   *
   * @param type Type of event to listen for, or `"*"` for all events
   * @param handler Function to call in response to given event
   */
  on(type: string, handler: (event?: any) => void) {
    (this._events[type] || (this._events[type] = [])).push(handler);
  }

  /**
   * Remove an event handler for the given type.
   *
   * @param type Type of event to unregister `handler` from, or `"*"`
   * @param handler Handler function to remove
   */
  off(type: string, handler: (event?: any) => void) {
    if (this._events[type]) {
      this._events[type].splice(this._events[type].indexOf(handler) >>> 0, 1);
    }
  }

  /** @ignore */
  protected removeAllListeners(): void {
    this._events = {};
  }

  /**
   * Invoke all handlers for the given type.
   * If present, `"*"` handlers are invoked after type-matched handlers.
   *
   * @param type The event type to invoke
   * @param evt Any value (object is recommended and powerful), passed to each handler
   * @ignore
   */
  protected emit<T, U = void>(type: string, ...data: [T?, U?]) {
    (this._events[type] || []).slice().map(handler => { handler(...data); });
  }
}
