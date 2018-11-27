import { type, animationEnd, toggleClass, mergeDefault, bindOnce } from '../utils';

export interface ToastStyle {
  host: string;
  enter: string;
  leave: string;
  backdrop: string;
}

export interface ToastConfig {
  /**
   * toast message
   */
  content: string;
  /**
   * apply animation
   */
  animation: boolean;
  /**
   * toast last time
   */
  duration: number;
  /**
   * modal mode
   */
  backdrop: boolean;
  /**
   * set to `true` to use `innerHTML` instead of `innerText`
   */
  unsafe: boolean;
  /**
   * display at the center of the window
   */
  center: boolean;
  /**
   * mount element
   */
  host?: HTMLElement;
  /**
   * class name
   */
  classes?: ToastStyle;
};
let defaults: ToastConfig = {
  content: '',
  animation: true,
  duration: 1000,
  backdrop: false,
  unsafe: false,
  center: false,
  host: document.body
};

(toast as any).config = config;

function toast(config: ToastConfig): Promise<void> {
  return apply(mergeDefault(defaults, type(config) === 'object' ? config : { content: String(config) }));
}

function config(config: ToastConfig) {
  defaults = mergeDefault(defaults, config) as ToastConfig;
}

function apply(config: ToastConfig): Promise<void> {
  // Both `classes.leave` and `classes.enter` are required for animation
  if (!config.classes || !config.classes.enter || !config.classes.leave && config.animation) {
    config.animation = false;
  }

  return new Promise(resolve => {
    let element = document.createElement('div');
    const classes = config.classes || {} as ToastStyle;

    element[config.unsafe ? 'innerHTML' : 'innerText'] = config.content;
    classes.host && (element.className = classes.host);

    if (config.backdrop) element.classList.add(classes.backdrop);

    config.host.appendChild(element);

    if (config.center) {
      element.setAttribute('style', `left:${Math.round((config.host.offsetWidth - element.offsetWidth) / 2)}px;top:${Math.round((window.innerHeight - element.offsetHeight) / 2)}px`);
    }

    if (config.animation) {
      // enter animation
      bindOnce(element, animationEnd, () => {
        element.classList.remove(classes.enter);

        // leave animation
        bindOnce(element, animationEnd, () => {
          destroy();
        })

        setTimeout(() => toggleClass(element, classes.leave, false), config.duration);
      })
      element.classList.add(classes.enter);
    }
    else {
      setTimeout(() => destroy(), config.duration);
    }

    function destroy() {
      config.host.removeChild(element);
      element = null;
      resolve();
    }
  })
}

export { toast }
