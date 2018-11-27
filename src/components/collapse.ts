import { EventEmitter } from 'eventemitter3';
import { bindOnce, delegate, mergeDefault, transitionEnd } from '../utils';

export interface CollapseStyle {
  active: string;
}

export interface CollapseConfig {
  selectors?: {
    title?: string;
    content?: string;
  };
  classes?: CollapseStyle;
  event?: string;
  accordion?: boolean;
  /**
   * apply height changes to DOM, useful for animation
   */
  useHeight?: boolean,
  /**
   *  indexs of items which need to be expanded after initialization
   */
  indexes?: number[];
}
interface CollapseElement { title: HTMLElement; content: HTMLElement; contentHeight?: number; active?: boolean; }
const Events = {
  expand: 'expand',
  collapse: 'collapse'
}
let defaults: CollapseConfig = {
  selectors: {
    title: 'header',
    content: 'article',
  },
  classes: {} as CollapseStyle,
  event: 'click',
  indexes: [-1],
  accordion: false,
  useHeight: true
}

/**
 * @export
 * @class Collapse
 * @extends {EventEmitter}
 * @example
 * <collapse>
 *   <div>
 *     <header>title 1</header>
 *     <article>article 1</article>
 *   </div>
 *   <div>
 *     <header>title 1</header>
 *     <article>article 1</article>
 *   </div>
 *   <div>
 *     <header>title 1</header>
 *     <article>article 1</article>
 *   </div>
 * </collapse>
 *
 * const collapse = new Collapse(document.getElementById('collapse'), {});
 * collapse.on('collapse', (content, title) => {});
 * collapse.on('expand', (content, title) => {});
 */
export class Collapse extends EventEmitter {
  host: HTMLElement;
  private config: CollapseConfig;
  private items: Array<CollapseElement> = [];
  private busy: boolean;

  static config(config: CollapseConfig, pure?: boolean): CollapseConfig {
    const ret = mergeDefault(defaults, config) as CollapseConfig;

    if (pure) return ret;
    else defaults = ret;
  }

  /**
   * Creates an instance of Collapse.
   *
   * @param {HTMLElement} element
   * @param {CollapseConfig} [config={}]
   * @memberof Collapse
   */
  constructor(element: HTMLElement, config: CollapseConfig = {}) {
    super();
    this.config = Collapse.config(config, true);
    this.host = element;

    this.refresh(true);

    delegate.bind(element)(this.config.event, this.config.selectors.title, (target: HTMLElement) => {
      if (this.busy) return;
      this.busy = true;
      this.toggle(this.items.map(i => i.title).indexOf(target));
    });
  }

  toggle(index: number): void {
    const item = this.items[index];

    if (item)
      this[item.active ? 'collapse' : 'expand'](index);
  }

  /**
   * Collapses a specified item
   *
   * @param {number} index
   * @param {boolean} directly
   * @memberof Collapse
   */
  collapse(index: number, directly?: boolean): void {
    const item = this.items[index];
    const classes = this.config.classes;

    if (item && item.active) {
      classes.active && [item.title, item.content].forEach(el => el.classList.remove(classes.active));
      if (this.config.useHeight && !directly) {
        bindOnce(item.content, transitionEnd, () => {
          item.content.style.display = 'none';
          // reset
          item.content.style.maxHeight = item.content.style.paddingTop = item.content.style.paddingBottom = '';
          this.busy = false;
        });

        // trigger transition
        item.content.style.maxHeight = item.contentHeight + 'px';
        setTimeout(() => {
          item.content.style.maxHeight = item.content.style.paddingTop = item.content.style.paddingBottom = '0';
        }, 0);
      } else item.content.style.display = 'none';

      this.emit(Events.collapse, item.content);
      item.active = false;
    }
  }

  /**
   * Expands a specified item
   *
   * @param {number} index
   * @param {boolean} directly
   * @memberof Collapse
   */
  expand(index: number, directly?: boolean): void {
    const item = this.items[index];
    const classes = this.config.classes;

    if (item && !item.active) {
      classes.active && [item.title, item.content].forEach(el => el.classList.add(classes.active));
      if (this.config.useHeight && !directly) {
        bindOnce(item.content, transitionEnd, () => {
          // reset
          item.content.style.maxHeight = item.content.style.paddingTop = item.content.style.paddingBottom = '';
          this.busy = false;
        });

        // trigger transition
        item.content.style.maxHeight = item.content.style.paddingTop = item.content.style.paddingBottom = '0';
        item.content.style.display = '';
        setTimeout(() => {
          item.content.style.maxHeight = item.contentHeight + 'px';
          item.content.style.paddingTop = item.content.style.paddingBottom = '';
        }, 0);
      } else item.content.style.display = '';

      this.emit(Events.expand, item.content);
      item.active = true;
    }

    if (this.config.accordion && !directly)
      this.items.forEach((_, i) => index !== i && this.collapse(i))
  }


  /**
   * Refresh the hole list
   *
   * @param {boolean} reset
   * @memberof Collapse
   */
  refresh(reset: boolean): void {
    const titles = this.host.querySelectorAll(this.config.selectors.title);
    const contents = this.host.querySelectorAll(this.config.selectors.content);
    const items: CollapseElement[] = [];

    titles.forEach((title, i) => {
      const content = contents[i] as HTMLElement;

      if (!content) return;

      const t = { title, content, active: true } as CollapseElement;

      if (this.config.useHeight)
        t.contentHeight = content.offsetHeight;

      items.push(t);
    })

    this.items = items;

    if (reset)
      items.forEach((_, i: number) => this[~this.config.indexes.indexOf(i) ? 'expand' : 'collapse'](i, true));
  }

  destroy() {
    this.removeAllListeners();
    this.host = this.items = this.config = null;
  }
}
