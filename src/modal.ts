import { animationend, bindOnce, delegate, EventEmitter, mergeDefaults } from './utils';

interface ModalAction {
  /**
   * Type of the action(anchor) button
   */
  type?: 'close' | 'cancel' | 'confirm';
  /**
   * Text content of the action(anchor) button
   */
  label: string;
  /**
   * Class name of the action(anchor) button
   */
  class?: string;
  /**
   * `href` attribute
   */
  redirect?: string;
  /**
   * `target` attribute
   */
  target?: string;
  /**
   * callback function
   */
  callback?: Function;
}

/**
 * Modal classes
 *
 * ```html
 * <div class="host">
 *   <div class="body">
 *   </div>
 *   <div class="backdrop"></div>
 * </div>
 * ```
 */
interface ModalStyle {
  host: string;
  body: string;
  enter: string;
  leave: string;
  backdrop: string;
}

interface ModalConfig {
  /**
   * Mount element
   */
  host?: HTMLElement;
  /**
   * Modal title
   */
  title?: string;
  /**
   * Modal content
   */
  content: string;
  /**
   * Apply animation, require `classes.enter` and `classes.leave`
   */
  animation?: boolean;
  /**
   * Close modal when clicking on backdrop
   */
  autoclose?: boolean;
  /**
   * Class names
   */
  classes?: ModalStyle;
  /**
   * Event type
   */
  event: string;
  /**
   * Action button(anchor) list
   */
  actions: ModalAction[];
}

/**
 * References of the modal elements
 *
 * ```html
 * <body>
 *   <header></header>
 *   <content></content>
 *   <footer></footer>
 * </body>
 * ```
 */
interface ModalElements {
  body?: HTMLElement;
  header?: HTMLElement;
  content?: HTMLElement;
  footer?: HTMLElement;
}

enum State {
  'OPENED',
  'CLOSED',
  'OPENING',
  'CLOSING'
}
const Events = {
  open: 'open',
  close: 'close',
  cancel: 'cancel',
  confirm: 'confirm',
}
let defaults: ModalConfig = {
  host: document.body,
  title: '',
  content: '',
  animation: true,
  event: 'click',
  autoclose: true,
  actions: []
}

/**
 * Modal
 *
 * ### Example
 *
 * ```javascript
 * const modal = new Modal({
 *   host: document.body, // by default
 *   title: 'title',
 *   content:
 *     `<p>click <a data-type="close">here</a> to close.</p>
 *      <p>click <a data-type="cancel">here</a> to cancel.</p>
 *      <p>click <a data-type="confirm">here</a> to confirm.</p>`,
 *   animation: true, // by default
 *   event: 'click', // by default
 *   autoclose: true. // by default
 *   actions: [
 *     { type: 'close', label: 'close' },
 *     { type: 'cancel', label: 'cancel' },
 *     { type: 'confirm', label: 'ok' },
 *     {
 *       label: 'search it',
 *       redirect: 'https://www.google.com/search?q=',
 *       target: '_blank',
 *     },
 *     {
 *       label: 'noop', callback: function () {
 *         this.close()
 *       }
 *     },
 *   ],
 * });
 *
 * modal.open().then(() => {});
 * modal.close().then(() => {});
 *
 * modal.on('open', () => {});
 * modal.on('close', () => {});
 * modal.on('cancel', () => {});
 * modal.on('confirm', () => {});
 * ```
 */
export class Modal extends EventEmitter {
  private state = State.CLOSED;
  private host: HTMLElement;
  private config: ModalConfig;

  el: ModalElements = {};

  /**
   * Modify the default configuration
   */
  static config(config: ModalConfig, pure?: boolean): ModalConfig {
    const ret = mergeDefaults(defaults, config);

    if (!animationend) ret.animation = false;

    if (pure) return ret;
    else defaults = ret;
  }

  /**
   * Cconstructor
   *
   * @param config - ModalConfig
   */
  constructor(config: ModalConfig) {
    super();
    this.config = Modal.config(config, true);
    this.render();

    delegate.bind(this.host)(this.config.event, '[data-action]', (target: HTMLElement) => {
      const action = target.dataset.action;
      switch (action) {
        case Events.close:
          this.close();
          break;

        case Events.cancel:
          this.emit(Events.cancel);
          this.close();
          break;

        case Events.confirm:
          this.emit(Events.confirm);
          this.close();
          break;
      }
    });

    return this;
  }

  private render() {
    const config = this.config,
      classes = config.classes || {} as ModalStyle,
      container = document.createElement('div'),
      backdrop = document.createElement('div'),
      body = document.createElement('div'),
      content = document.createElement('article');
    let footer: HTMLElement;

    classes.host && (container.className = classes.host);
    classes.backdrop && (backdrop.className = classes.backdrop);
    classes.body && (body.className = classes.body);

    if (config.title) {
      const header = document.createElement('header');
      header.innerHTML = config.title;
      body.appendChild(header);
      this.el.header = header;
    }
    if (config.autoclose) backdrop.dataset.action = Events.close;

    content.innerHTML = config.content;

    if (config.actions && config.actions.length) {
      footer = document.createElement('footer');
      config.actions.forEach(action => {
        const a = document.createElement('a');
        a.innerHTML = action.label;
        if (action.class) a.className = action.class;
        if (action.type) a.dataset.action = action.type;
        if (action.redirect) a.href = action.redirect;
        if (action.target) a.target = action.target;
        if (action.callback) a.addEventListener(config.event, action.callback.bind(this));

        footer.appendChild(a);
      });
    }

    body.appendChild(content);
    if (footer) {
      body.appendChild(footer);
      this.el.footer = footer;
    }
    container.appendChild(backdrop);
    container.appendChild(body);
    this.host = container;
    this.el.body = body;
    this.el.content = content;
  }

  private setOverflow(hidden?: boolean) {
    this.config.host.style.overflow = hidden ? 'hidden' : '';
  }

  /**
   * Open modal
   *
   * @returns promise
   */
  open(): Promise<void> {
    if (this.state === State.OPENING || this.state === State.OPENED)
      return Promise.reject();

    this.setOverflow(true);

    if (!this.config.classes.enter || !this.config.animation) {
      this.config.host.appendChild(this.host);
      this.state = State.OPENED;
      this.emit(Events.open);
      return Promise.resolve();
    }

    return new Promise(resolve => {
      this.host.classList.add(this.config.classes.enter);
      bindOnce(this.host, animationend, () => {
        this.host.classList.remove(this.config.classes.enter);
        this.state = State.OPENED;
        this.emit(Events.open);
        resolve(this as any);
      });
      this.state = State.OPENING;
      this.config.host.appendChild(this.host);
    });
  }

  /**
   * Close modal
   *
   * @returns promise
   */
  close(): Promise<void> {
    if (this.state === State.CLOSING || this.state === State.CLOSED)
      return Promise.reject();

    this.setOverflow();

    if (!this.config.classes.leave || !this.config.animation) {
      this.config.host.removeChild(this.host);
      this.state = State.CLOSED;
      this.emit(Events.close);
      return Promise.resolve();
    }

    return new Promise(resolve => {
      bindOnce(this.host, animationend, () => {
        this.config.host.removeChild(this.host);
        this.host.classList.remove(this.config.classes.leave);
        this.state = State.CLOSED;
        this.emit(Events.close);
        resolve(this as any);
      });

      this.state = State.CLOSING;
      this.host.classList.add(this.config.classes.leave);
    });
  }

  /**
   * Destroy instance, remove all listeners
   */
  destroy(): void {
    this.removeAllListeners();
    this.host = this.el = this.config = null;
  }
}
