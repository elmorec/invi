/**
 * Find closest elements to the element
 *
 * @param element
 * @param selector
 * @param context - range
 * @returns return an array
 */
export declare function closest(element: any, selector: string, context?: Element): Element[];
/**
 * Event delegation
 *
 * ### Example
 *
 * ```typescript
 * delegate.bind(document)('click', 'a', function(a, ev) {
 * });
 * ```
 *
 * @param eventType
 * @param {string} selector
 * @param {(el: Element, event: Event) => void} callback
 */
export declare function delegate(this: Element, eventType: string, selector: string, callback: (el: Element, event: Event) => void): void;
export declare function isDocument(obj: any): boolean;
export declare function bindOnce(element: Element, eventType: string, callback: () => void, options?: {
    passive: boolean;
}): void;
export declare function css(element: HTMLElement, styles: CSSStyleDeclaration): void;
/**
 *
 * @param key - w3c standard style property
 * @param css - return css style property (kebab case)
 * @returns property
 */
export declare function xProperty(key: string, css?: boolean): string;
export declare const isTouch: boolean;
export declare const animationend: string;
export declare const transitionend: string;
