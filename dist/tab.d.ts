import { EventEmitter } from './utils';
interface TabStyle {
    /** CSS class name of current tab */
    active?: string;
}
interface TabConfig {
    /**
     * CSS selectors for quering tab and content elements
     */
    selectors?: {
        /**
         * Tab element selector
         *
         * @default `a`
         */
        tab?: string;
        /**
         * Content element selector
         *
         * @default `article`
         */
        content?: string;
    };
    /**
     *  Index of tab need to be actived after initialization
     */
    index?: number;
    /** CSS class name */
    classes?: TabStyle;
    /**
     * The type of event that is bound on the tab to trigger switch
      *
      * @default `click`
     */
    event?: string;
}
/**
 * ## Tab
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
 * const tab = new Tab(document.getElementById('tab'));
 *
 * tab.on('switch', ({title, content, current, previous}) => {})
 * ```
 */
export declare class Tab extends EventEmitter {
    host: HTMLElement;
    private _config;
    private _current;
    private _tabs;
    private _contents;
    private _removeDelegate;
    /**
     * Modify the default configuration
     */
    static config(config: TabConfig, pure?: boolean): TabConfig;
    /**
     * @param host container element
     * @param config
     */
    constructor(host: HTMLElement, config?: TabConfig);
    /**
     * Switch to a specified index
     *
     * @param index
     */
    switch(index: number): void;
    /**
     * Refresh tab list, and switch to a specified index
     *
     * @param index
     */
    refresh(index: number): void;
    /**
     * Destroy tab instance, remove all listeners
     */
    destroy(): void;
}
export {};
