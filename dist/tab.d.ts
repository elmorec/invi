import { EventEmitter } from './utils';
interface TabStyle {
    /**
     * Class name which applied to current tab
     */
    active?: string;
}
interface TabConfig {
    /**
     * CSS selectors for quering tab and content element
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
     * current actived tab element
     */
    tab: HTMLElement;
    /**
     * current actived content element
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
 *   tabElement, // current tab element
 *   contentElement, // current content element
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
     * @param force - silence switch (synchronize the operation)
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
