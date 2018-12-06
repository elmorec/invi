declare class EventEmitter {
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
interface CollapseStyle {
    /**
     * Class name which applied to the actived element
     */
    active: string;
}
interface CollapseConfig {
    /**
     * CSS selectors for quering title and content element
     */
    selectors?: {
        title?: string;
        content?: string;
    };
    /**
     * Class names
     */
    classes?: CollapseStyle;
    /**
     * Event type
     */
    event?: string;
    /**
     * Accordion mode
     */
    accordion?: boolean;
    /**
     * Apply height change to DOM for animation propose
     */
    useHeight?: boolean;
    /**
     *  Indexs of items which need to be expanded after initialization
     */
    indexes?: number[];
}
/**
 * Collapse
 *
 * ### Example
 *
 * ```html
 * <section id="collapse">
 *   <div>
 *     <header>title 1</header>
 *     <article>content 1</article>
 *   </div>
 *   <div>
 *     <header>title 2</header>
 *     <article>content 2</article>
 *   </div>
 *   <div>
 *     <header>title 3</header>
 *     <article>content 3</article>
 *   </div>
 * </section>
 * ```
 *
 * ```javascript
 * const collapse = new Collapse(document.getElementById('collapse'), {
 *   selectors: {
 *     title: 'header', // by default
 *     content: 'article' // by default
 *   },
 *   event: 'click', // by default
 *   useHeight: true, // by default
 *   classes: { active: 'active' },
 *   accordion: true,
 *   indexes: [1],
 * });
 * collapse.on('collapse', (content, title) => {});
 * collapse.on('expand', (content, title) => {});
 * ```
 */
export declare class Collapse extends EventEmitter {
    host: HTMLElement;
    private config;
    private items;
    private busy;
    /**
     * Modify the default configuration
     */
    static config(config: CollapseConfig, pure?: boolean): CollapseConfig;
    /**
     * Cconstructor
     *
     * @param element -
     * @param config - CollapseConfig
     */
    constructor(element: HTMLElement, config?: CollapseConfig);
    /**
     * Toggle display the specified item
     *
     * @param index -
     */
    toggle(index: number): void;
    /**
     * Collapse the specified item
     *
     * @param index -
     * @param directly - collapse directly without animation
     */
    collapse(index: number, directly?: boolean): void;
    /**
     * Expand the specified item
     *
     * @param index
     * @param directly - expand directly without animation
     */
    expand(index: number, directly?: boolean): void;
    /**
     * Refresh list
     *
     * @param reset - rest status using initial configuration
     */
    refresh(reset: boolean): void;
    /**
     * Destroy instance, remove all listeners
     */
    destroy(): void;
}
export {};
