import { EventEmitter } from './utils';
interface CollapsibleStyle {
    /** CSS class name of the title element when expanded */
    titleActive: string;
    /** CSS class name of the content element when expanded */
    contentActive: string;
}
interface CollapsibleConfig {
    /**
     * CSS selector for querying title and content elements
     */
    selectors?: {
        /**
         * Title element selector
         *
         * @default `header`
         */
        title?: string;
        /**
         * Content element selector
         *
         * @default `article`
         */
        content?: string;
    };
    /** CSS class name */
    classes?: CollapsibleStyle;
    /**
     * The type of event that is bound on the title to trigger expand/collapse
      *
      * @default `click`
     */
    event?: string;
    /**
     * Accordion mode
     *
     * @default false
     */
    accordion?: boolean;
    /**
     * Whether to use animation
     *
     * @default true
     */
    animation?: boolean;
    /**
     * Animation duration in ms
     *
     * @default 300
     */
    duration?: number;
    /**
     * Items that need to be expanded after initialization,
     * all are collapsed by default
     */
    index?: number | number[];
}
/**
 * ## Collapsible
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
 * const collapsible = new Collapsible(
 *   document.getElementById('collapse')
 * );
 *
 * collapsible.on('collapse', ({title, content, index}) => {});
 * collapsible.on('expand', ({title, content, index}) => {});
 * ```
 */
export declare class Collapsible extends EventEmitter {
    host: HTMLElement;
    private _config;
    private _items;
    private _removeDelegate;
    /**
     * Modify the default configuration
     */
    static config(config: CollapsibleConfig, pure?: boolean): CollapsibleConfig;
    /**
     * @param host container element
     * @param config
     */
    constructor(host: HTMLElement, config?: CollapsibleConfig);
    /**
     * Toggle item
     *
     * @param index
     * @param direct toggle directly without transition
     * @returns return promise if animation is enabled
     */
    toggle(index: number | number[], direct?: boolean): void | Promise<void>;
    /**
     * Collapse item
     *
     * @param index
     * @param direct collapse directly without animation
     * @returns return promise if animation is enabled
     */
    collapse(index: number | number[], direct?: boolean): void | Promise<void>;
    /**
     * Expand item
     *
     * @param index
     * @param direct expand directly without animation
     * @returns return promise if animation is enabled
     */
    expand(index: number | number[], direct?: boolean): void | Promise<void>;
    /**
     * Refresh
     *
     * @param reset Expand the specified items with initial configuration
     */
    refresh(reset: boolean): void;
    /**
     * Destroy instance, remove all listeners
     */
    destroy(): void;
}
export {};
