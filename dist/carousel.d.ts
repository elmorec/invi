import { EventEmitter } from './utils';
interface CarouselStyle {
    /**
     * Class name which applied to current slide
     */
    active: string;
    /**
     * Class name which applied to current indicator
     */
    indicatorActive?: string;
}
interface CarouselConfig {
    /**
     * CSS selectors for quering carousel item
     */
    selectors?: {
        item: string;
        indicator?: string;
    };
    /**
     * Class names
     */
    classes?: CarouselStyle;
    /**
     *  Slide speed in ms
     */
    speed?: number;
    /**
     *  Loop mode
     */
    continuous?: boolean;
    /**
     * Threshold to determine if the slide is valid (0-1)
     */
    threshold?: number;
    /**
     * Resistance (0-1)
     */
    resistance?: number;
    /**
     *  Index of slide which need to be showed after initialization
     */
    index?: number;
    /**
     *  Autoplay
     */
    auto?: boolean;
    /**
     *  Dely for autoplay in ms
     */
    delay?: number;
}
/**
 * Carousel
 *
 * ### Example
 *
 * ```html
 * <section id="slide">
 *   <ul>
 *     <li>slide 1</li>
 *     <li>slide 2</li>
 *     <li>slide 3</li>
 *   <ul>
 * </section>
 * ```
 *
 * ```javascript
 * const slide = new Carousel(document.getElementById('slide'), {
 *   selectors: {
 *     item: 'li' // by default
 *   },
 *   speed: 500, // by default
 *   threshold: .4, // by default
 *   resistance: .4, // by default
 *   delay: 4000 // by default
 *   auto: true,
 *   index: 1,
 * });
 *
 * // triggered before slide
 * slide.on('slide', (current, next) => {})
 *
 * // triggered after slide
 * slide.on('slideChange', (current, previous) => {})
 * ```
 */
export declare class Carousel extends EventEmitter {
    host: HTMLElement;
    private config;
    private container;
    private items;
    private indicators;
    private size;
    private step;
    private current;
    private busy;
    private instance;
    private running;
    private offEvents;
    /**
     * Modify the default configuration
     */
    static config(config: CarouselConfig, pure?: boolean): CarouselConfig;
    /**
     * Cconstructor
     *
     * @param element -
     * @param config - CarouselConfig
     */
    constructor(element: HTMLElement, config?: CarouselConfig);
    /**
     * Requery all slide items
     */
    setup(): void;
    private setupEvents;
    private translate;
    /**
     * Move to a position with transition
     *
     * @param to - The index number to slide to
     * @param speed - CSS transitionDuration in ms
     */
    private move;
    /**
     * Slide to item
     *
     * @param index
     */
    slide(index: number): Promise<boolean>;
    /**
     * Slide to next
     */
    next(): Promise<boolean>;
    /**
    * Slide to previous
    */
    prev(): Promise<boolean>;
    /**
     * Autoplay
     */
    start(): void;
    /**
     * Stop autoplay
     */
    stop(): void;
    /**
     * Destroy instance, remove all listeners
     */
    destroy(): void;
}
export {};
