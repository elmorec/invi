import { upperFirst, kebabCase, map } from './functions';

/**
 * Find closest elements to the element
 */
export function closest(element: any, selector: string, context: Element = document.body): Element[] {
  const out: Element[] = [];
  const coll = map(context.querySelectorAll(selector), i => i);

  // while (element && !(element.matches(selector)))
  while (element && !~coll.indexOf(element))
    element = element !== context && !isDocument(element) && element.parentNode;

  if (element && out.indexOf(element) < 0) out.push(element)

  return out;
}

/**
 * Event delegation
 *
 * ### Example
 *
 * ```typescript
 * delegate.bind(document)('click', 'a', function(a, ev) {
 * });
 * ```
 */
export function delegate(
  this: Element,
  eventType: string,
  selector: string,
  callback: (el: Element, event: Event) => void
): () => void {
  const element = this;
  const handler = (event: Event) => {
    const match = closest(event.target, selector, element)[0];

    if (match) callback(match, event);
  };

  element.addEventListener(eventType, handler);

  return function () {
    element.removeEventListener(eventType, handler);
  }
}

export function isDocument(obj: any): boolean { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }

export function bindOnce(element: Element, eventType: string, callback: () => void, options = { passive: true }): void {
  const handler = function () {
    callback();
    element.removeEventListener(eventType, handler, options as any);
  };
  element.addEventListener(eventType, handler, options);
}

export function bindTransition(element: Element, propertyName: string, callback: () => void): void {
  const handler = function (e: TransitionEvent) {
    if (e.propertyName === propertyName) {
      callback();
      element.removeEventListener(transitionend, handler);
    }
  };
  element.addEventListener(transitionend, handler);
}

export function css(element: HTMLElement, styles: CSSStyleDeclaration): void {
  for (const key in styles) {
    element.style[key] = styles[key];
  }
}

const properties: {
  [key: string]: [string, string];
} = {};

/**
 *
 * @param key w3c standard style property
 * @param css return css style property (kebab case)
 * @returns property
 */
export function xProperty(key: string, css?: boolean): string {
  if (key in document.body.style) return key;
  if (properties[key]) return properties[key][css ? 1 : 0];

  const upperKey = upperFirst(key);
  const map = ['webkit', 'Moz', 'O', 'ms'];

  for (let i = 0; i < map.length; i++) {
    const e = map[i] + upperKey;
    if (e in document.body.style) {
      // The W3C standard won't goes here.
      properties[key] = [e, kebabCase(upperFirst(e))];
      return properties[key][css ? 1 : 0];
    }
  }
}

export const isTouch: boolean = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));

export const animationend: string = (function () {
  const map = {
    'animation': 'animationend',
    'webkitAnimation': 'webkitAnimationEnd',
    'MozAnimation': 'animationend',
    // Opera 12
    'OAnimation': 'oanimationend'
  } as any;

  for (const name in map) {
    if (name in document.body.style) {
      return map[name]
    }
  }
})();

export const transitionend: string = (function () {
  const map = {
    'transition': 'transitionend',
    'webkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    // Opera 12
    'OTransition': 'otransitionEnd'
  } as any;

  for (const name in map) {
    if (name in document.body.style) {
      return map[name]
    }
  }
})();
