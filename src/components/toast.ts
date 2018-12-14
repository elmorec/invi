import { animationEnd, bindOnce, mergeDefault, type } from '../utils';

interface ToastStyle {
  /**
   * Class name of container element
   */
  host: string;
  /**
   * Class name applied to container when it is attached to DOM
   */
  enter: string;
  /**
   * Class name applied to container when it is detached from DOM
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
   */
  animation?: boolean;
  /**
   * Toast duration
   */
  duration?: number;
  /**
   * Uses `innerHTML` to apply content instead of `innerText`
   */
  unsafe?: boolean;
  /**
   * Mount element
   */
  host?: HTMLElement;
  /**
   * Class names
   */
  classes?: ToastStyle;
};

interface Toast {
  /**
   * Modify the default configuration
   */
  config(config: ToastConfig): void;

  /**
   * Create a toast and display it
   */
  (arg: ToastConfig | string): Promise<void>;
}

let defaults: ToastConfig = {
  content: '',
  animation: true,
  duration: 1000,
  unsafe: false,
  host: document.body
};

/**
 * Toast
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
 * ```
 *
 * Custom configuration
 *
 * ```javascript
 * toast({
 *   content: 'content';
 *   animation: true; // by default
 *   duration: 1000; // by default
 *   backdrop: false; // by default
 *   unsafe: false; // by default
 *   center: false; // by default
 *   host: document.body; // by default
 * });
 * ```
 */
const toast = <Toast>function (config: ToastConfig = {}) {
  return apply(mergeDefault(defaults, type(config) === 'object' ? config : { content: String(config) }));
};

toast.config = function config(config: ToastConfig) {
  defaults = mergeDefault(defaults, config) as ToastConfig;
};

function apply(config: ToastConfig): Promise<void> {
  let element = document.createElement('div');
  const classes = config.classes || {} as ToastStyle;

  element[config.unsafe ? 'innerHTML' : 'innerText'] = config.content;
  classes.host && (element.className = classes.host);

  config.host.appendChild(element);

  return new Promise<void>(resolve => {
    if (classes.enter && config.animation) {
      element.classList.add(classes.enter);
      bindOnce(element, animationEnd, () => {
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
        bindOnce(element, animationEnd, () => {
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

export { toast };
