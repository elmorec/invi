import { EventEmitter } from 'eventemitter3';
import { delegate, mergeDefault, animationEnd, bindOnce } from '../utils';

export interface ModalStyle {
  host: string;
  body: string;
  enter: string;
  leave: string;
  backdrop: string;
};

interface Action {
  type?: 'close' | 'cancel' | 'confirm';
  label: string;
  class?: string;
  redirect?: string;
  target?: string;
  callback?: Function;
}
export interface ModalConfig {
  host?: HTMLElement;
  title?: string;
  content: string;
  animation?: boolean;
  autoclose?: boolean;
  classes?: ModalStyle;
  event: string;
  actions: Action[];
}
enum STATE {
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
  title: '',
  content: '',
  animation: true,
  host: document.body,
  event: 'click',
  autoclose: true,
  actions: []
}

/**
 *
 *
 * @export
 * @class Modal
 * @extends {EventEmitter}
 * @example
 * const modal = new Modal({
 *   title: 'Sample title',
 *   content: 'sample content',
 *   actions: [
 *     { type: 'close', label: 'close' },
 *     { type: 'cancel', label: 'cancel' },
 *     { type: 'confirm', label: 'ok' },
 *     { label: 'search it', redirect: 'https://www.google.com', target: '_blank' },
 *     {
 *       label: 'noop', callback: function (event) {
 *         this.close()
 *       }
 *     }
 *   ]
 * });
 *
 * modal.on('open', () => {});
 * modal.on('close', () => {});
 * modal.on('confirm', () => {});
 * modal.on('cancel', () => {});
 */
export class Modal extends EventEmitter {
  private state: STATE;
  private host: Element;
  private config: ModalConfig;

  el: { body?: Element; header?: Element; content?: Element; footer?: Element } = {};

  static config(config: ModalConfig, pure?: boolean): ModalConfig {
    const ret = mergeDefault(defaults, config);

    // Both `classes.leave` and `classes.enter` are required for animation
    if (!ret.classes || !ret.classes.enter || !ret.classes.leave && ret.animation) {
      ret.animation = false;
    }

    if (pure) return ret;
    else defaults = ret;
  }

  /**
   * Creates an instance of Modal.
   *
   * @param {ModalConfig} config
   * @memberof Modal
   */
  constructor(config: ModalConfig) {
    super();
    this.config = Modal.config(config, true);
    this.render();

    delegate.bind(this.host)(this.config.event, '[data-action]', target => {
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
    const classes = this.config.classes || {} as ModalStyle,
      container = document.createElement('div'),
      backdrop = document.createElement('div'),
      body = document.createElement('div'),
      content = document.createElement('article'),
      footer = document.createElement('footer');

    classes.host && (container.className = classes.host);
    classes.backdrop && (backdrop.className = classes.backdrop);
    classes.body && (body.className = classes.body);

    if (this.config.title) {
      const header = document.createElement('header');
      header.innerHTML = this.config.title;
      body.appendChild(header);
      this.el.header = header;
    }
    if (this.config.autoclose) backdrop.dataset.action = Events.close;

    content.innerHTML = this.config.content;

    this.config.actions.forEach(action => {
      const a = document.createElement('a');
      a.innerHTML = action.label;
      if (action.class) a.className = action.class;
      if (action.type) a.dataset.action = action.type;
      if (action.redirect) a.href = action.redirect;
      if (action.target) a.target = action.target;
      if (action.callback) a.addEventListener(this.config.event, action.callback.bind(this));

      footer.appendChild(a);
    });

    body.appendChild(content);
    body.appendChild(footer);
    container.appendChild(backdrop);
    container.appendChild(body);
    this.host = container;

    this.el.body = body;
    this.el.content = content;
    this.el.footer = footer;
  }

  open() {
    if (this.state === STATE.OPENING || this.state === STATE.OPENED) return;
    if (!this.config.animation) {
      this.config.host.appendChild(this.host);
      this.state = STATE.OPENED;
      this.emit(Events.open);
      return;
    }

    this.host.classList.add(this.config.classes.enter);
    bindOnce(this.host, animationEnd, () => {
      this.host.classList.remove(this.config.classes.enter);
      this.state = STATE.OPENED;
      this.emit(Events.open);
    });
    this.state = STATE.OPENING;
    this.config.host.appendChild(this.host);
  }

  close() {
    if (this.state === STATE.CLOSING || this.state === STATE.CLOSED) return;
    if (!this.config.animation) {
      this.config.host.removeChild(this.host);
      this.state = STATE.CLOSED;
      this.emit(Events.close);
      return;
    }

    bindOnce(this.host, animationEnd, () => {
      this.config.host.removeChild(this.host);
      this.host.classList.remove(this.config.classes.leave);
      this.state = STATE.CLOSED;
      this.emit(Events.close);
    });

    this.state = STATE.CLOSING;
    this.host.classList.add(this.config.classes.leave);
  }

  destroy() {
    this.removeAllListeners();
    this.host = this.el = this.config = null;
  }
}
