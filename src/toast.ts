import { animationend, bindOnce, mergeDefaults, type } from './utils';

interface ToastStyle {
  /**
   * Class name of container element
   */
  host: string;
  /**
   * Class name applied to container when being attached to DOM
   */
  enter: string;
  /**
   * Class name applied to container when being detached from DOM
   */
  leave: string;
};

interface ToastConfig {
  /**
   * Toast content
   */
  content?: string;
  /**
   * Apply animation, require `classes.enter` and `classes.leave`
   * @default true
   */
  animation?: boolean;
  /**
   * Toast duration
   * @default 1000
   */
  duration?: number;
  /**
   * Uses `innerHTML` to apply content instead of `innerText`
   * @default false
   */
  unsafe?: boolean;
  /**
   * Mount element
   * @default document.body
   */
  host?: HTMLElement;
  /**
   * Class names
   */
  classes?: ToastStyle;
};

/** @ignore */
let defaults: ToastConfig = {
  content: '',
  animation: true,
  duration: 1000,
  unsafe: false,
  host: document.body
};

/**
 * ## Toast
 *
 * ### Example
 *
 * Modify default configuration
 *
 * ```javascript
 * toast.config({
 *   classes: {
 *     host: 'toast',
 *     enter: 'toast-enter',
 *     leave: 'toast-leave',
 *     backdrop: 'toast-backdrop'
 *   },
 * });
 * ```
 *
 * Display a toast
 *
 * ```javascript
 * toast('content').then(() => {});
 * toast('content', {}).then(() => {});
 * toast({content: 'content'}).then(() => {});
 * ```
 *
 * Full configuration
 *
 * ```javascript
 * toast({
 *   content: 'content',
 *   animation: true,
 *   duration: 1000,
 *   backdrop: false,
 *   unsafe: false,
 *   center: false,
 *   host: document.body,
 * });
 * ```
 */
export function toast(content: string | ToastConfig, config?: ToastConfig) {
  if (typeof config !== 'object') {
    config = {}
  }
  return apply(mergeDefaults(
    defaults,
    type(content) === 'object' ? content : Object.assign({ content }, config)
  ));
};
/**
 * Modify the default configuration
 */
toast.config = function config(config: ToastConfig) {
  defaults = mergeDefaults(defaults, config) as ToastConfig;
  if (!animationend) defaults.animation = false;
};

/** @ignore */
function apply(config: ToastConfig): Promise<void> {
  let element = document.createElement('div');
  const classes = config.classes || {} as ToastStyle;

  element[config.unsafe ? 'innerHTML' : 'innerText'] = config.content;
  classes.host && (element.className = classes.host);

  config.host.appendChild(element);

  return new Promise(resolve => {
    if (classes.enter && config.animation) {
      element.classList.add(classes.enter);
      bindOnce(element, animationend, () => {
        element.classList.remove(classes.enter);
        delay();
      });
    } else delay();

    function delay() {
      setTimeout(() => resolve(), config.duration);
    }
  }).then(() => {
    if (classes.leave && config.animation)
      return new Promise<void>(resolve => {
        element.classList.add(classes.leave);
        bindOnce(element, animationend, () => {
          element.classList.remove(classes.leave);
          destroy();
          resolve();
        });
      });
    else destroy();

    function destroy() {
      config.host.removeChild(element);
      element = null;
    }
  });
}
