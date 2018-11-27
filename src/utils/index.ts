export function type(o) {
  const t = Object.prototype.toString.call(o).split(' ')[1].slice(0, -1).toLowerCase();
  return t.match(/element$/) ? 'element' : t;
}

export const isTouch = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));

export function closest(element: any, selector: string, context: Element = document.body): Element[] {
  const out = [];
  const coll = Array.from(context.querySelectorAll(selector));

  // while (element && !(element.matches(selector)))
  while (element && !~coll.indexOf(element))
    element = element !== context && !isDocument(element) && element.parentNode;

  if (element && out.indexOf(element) < 0) out.push(element)

  return out;
}

export function delegate(eventType: string, selector: string, callback: Function) {
  const element = this;

  element.addEventListener(eventType, event => {
    const match = closest(event.target, selector, element)[0];

    if (match) callback(match, event);
  });
}

export function isDocument(obj) { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }

export function forEach(list, fn) {
  return Array.prototype.forEach.call(list, fn)
}
export function arrayMap(list, fn) {
  return Array.prototype.map.call(list, fn)
}

export function toggleClass(element: Element, className: string, value?: boolean) {
  element.classList[(value !== undefined ? value : element.classList.contains(className)) ? 'remove' : 'add'](className)
}

export function mergeDefault(o1, o2) {
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

export function bindOnce(element: Element, eventType: string, callback: () => void, options = { passive: true }) {
  const handler = function () {
    callback();
    element.removeEventListener(eventType, handler, options as any);
  };
  element.addEventListener(eventType, handler, options);
}

export function css(element: HTMLElement, styles: CSSStyleDeclaration) {
  for (const key in styles) {
    element.style[key] = styles[key];
  }
}
