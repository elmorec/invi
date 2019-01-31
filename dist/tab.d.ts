class EventEmitter {
    private events;
    /**
     * Register an event handler for the given type.
     *
     * @param type - Type of event to listen for, or `"*"` for all events
     * @param handler - Function to call in response to given event
     */
    on(type: string, handler: (event?: any) => void): void;
    /**
     * Remove an event handler for the given type.
     *
     * @param type - Type of event to unregister `handler` from, or `"*"`
     * @param handler - Handler function to remove
     */
    off(type: string, handler: (event?: any) => void): void;
    removeAllListeners(): void;
    /**
     * Invoke all handlers for the given type.
     * If present, `"*"` handlers are invoked after type-matched handlers.
     *
     * @param type - The event type to invoke
     * @param evt - Any value (object is recommended and powerful), passed to each handler
     */
    emit(type: string, ...evt: any[]): void;
}
interface TabStyle {
    /**
     * Class name which applied to current tab
     */
    active?: string;
}
interface TabConfig {
    /**
     * CSS selectors for quering tab and content
     */
    selectors?: {
        tab?: string;
        content?: string;
    };
    /**
     *  Index of tab which need to be actived after initialization
     */
    index?: number;
    /**
     * Class names
     */
    classes?: TabStyle;
    /**
     * Event type
     */
    event?: string;
}
interface ActivatedTabSnapshot {
    /**
     * current actived tab
     */
    tab: HTMLElement;
    /**
     * current actived content
     */
    content: HTMLElement;
    /**
     * current index
     */
    current: number;
    /**
     * previous index
     */
    previous: number;
}
/**
 * Tab
 *
 * ### Example
 *
 * ```html
 * <section id="tab">
 *   <nav>
 *     <a>tab 1</a>
 *     <a>tab 2</a>
 *     <a>tab 3</a>
 *   </nav>
 *   <article>content 1</article>
 *   <article>content 2</article>
 *   <article>content 3</article>
 * </section>
 * ```
 *
 * ```javascript
 * const tab = new Tab(document.getElementById('tab'), {
 *   classes: { active: 'active' },
 *   selectors: {
 *     tab: 'a', // by default
 *     content: 'article' // by default
 *   },
 *   event: 'click' // by default,
 *   index: 1,
 * });
 *
 * tab.on('switch', (
 *   tabElement, // current tab
 *   contentElement, // current content
 *   current, // current index
 *   previous // previous index
 * ) => {})
 * ```
 */
export declare class Tab extends EventEmitter {
    host: HTMLElement;
    private config;
    private current;
    private tabs;
    private contents;
    /**
     * Modify the default configuration
     */
    static config(config: TabConfig, pure?: boolean): TabConfig;
    /**
     * Cconstructor
     *
     * @param element -
     * @param config - TabConfig
     */
    constructor(element: HTMLElement, config?: TabConfig);
    /**
     * Switch to the specified tab
     *
     * @param index -
     * @param force -
     * @returns return a promise if force is negative
     */
    switch(index: number, force?: boolean): Promise<ActivatedTabSnapshot> | void;
    /**
     * Refresh tab list
     */
    refresh(): void;
    /**
     * Destroy instance, remove all listeners
     */
    destroy(): void;
}
export {};
