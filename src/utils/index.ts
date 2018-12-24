export function type(o: any): string {
  const t = Object.prototype.toString.call(o).split(' ')[1].slice(0, -1).toLowerCase();
  return t.match(/element$/) ? 'element' : t;
}

export const isTouch = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));

export function closest(element: any, selector: string, context: Element = document.body): Element[] {
  const out: Element[] = [];
  const coll = Array.from(context.querySelectorAll(selector));

  // while (element && !(element.matches(selector)))
  while (element && !~coll.indexOf(element))
    element = element !== context && !isDocument(element) && element.parentNode;

  if (element && out.indexOf(element) < 0) out.push(element)

  return out;
}

export function delegate(this: Element, eventType: string, selector: string, callback: (el: Element, event: Event) => void): void {
  const element = this;

  element.addEventListener(eventType, (event: Event) => {
    const match = closest(event.target, selector, element)[0];

    if (match) callback(match, event);
  });
}

export function isDocument(obj: any): boolean { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }

export function forEach<T>(list: ArrayLike<T>, fn: (item: T, index: number) => void): Array<T> {
  return Array.prototype.forEach.call(list, fn)
}

export function map<T, K>(list: ArrayLike<T>, fn: (item: T, index: number) => K): Array<K> {
  return Array.prototype.map.call(list, fn)
}

export function mergeDefault(o1: any, o2: any) {
  const ret = { ...o1 };
  if (type(o2) !== 'object') return ret;
  for (const k in o2) {
    const v1 = o1[k], v2 = o2[k], t = type(v1);
    if (v1 === undefined || v1 === null) {
      ret[k] = v2;
      continue;
    }
    if (t !== type(v2)) continue;
    if (t === 'object') ret[k] = mergeDefault(v1, v2);
    else ret[k] = v2;
  }
  return ret;
}

export const animationEnd = (() => document.createElement('div').style.animation !== undefined ? 'animationend' : 'webkitAnimationEnd')();

export const transitionEnd = (() => document.createElement('div').style.transition !== undefined ? 'transitionend' : 'webkittransitionEnd')();

export function bindOnce(element: Element, eventType: string, callback: () => void, options = { passive: true }): void {
  const handler = function () {
    callback();
    element.removeEventListener(eventType, handler, options as any);
  };
  element.addEventListener(eventType, handler, options);
}

export function css(element: HTMLElement, styles: CSSStyleDeclaration): void {
  for (const key in styles) {
    element.style[key] = styles[key];
  }
}

export class EventEmitter {
  private events: { [type: string]: Function[] } = {};

  /**
   * Register an event handler for the given type.
   *
   * @param type - Type of event to listen for, or `"*"` for all events
   * @param handler - Function to call in response to given event
   */
  on(type: string, handler: (event?: any) => void) {
    (this.events[type] || (this.events[type] = [])).push(handler);
  }

  /**
   * Remove an event handler for the given type.
   *
   * @param type - Type of event to unregister `handler` from, or `"*"`
   * @param handler - Handler function to remove
   */
  off(type: string, handler: (event?: any) => void) {
    if (this.events[type]) {
      this.events[type].splice(this.events[type].indexOf(handler) >>> 0, 1);
    }
  }

  removeAllListeners(): void {
    this.events = {};
  }

  /**
   * Invoke all handlers for the given type.
   * If present, `"*"` handlers are invoked after type-matched handlers.
   *
   * @param type - The event type to invoke
   * @param evt - Any value (object is recommended and powerful), passed to each handler
   */
  emit(type: string, ...evt: any[]) {
    (this.events[type] || []).slice().map((handler) => { handler(...evt); });
  }
}
