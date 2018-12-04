import { bindOnce, delegate, EventEmitter, mergeDefault, transitionEnd } from '../utils';

interface CollapseStyle {
  /**
   * Class name which applied to the actived element
   */
  active: string;
};

interface CollapseConfig {
  /**
   * CSS selectors for quering title and content element
   */
  selectors?: {
    title?: string;
    content?: string;
  };
  /**
   * Class names
   */
  classes?: CollapseStyle;
  /**
   * Event type
   */
  event?: string;
  /**
   * Accordion mode
   */
  accordion?: boolean;
  /**
   * Apply height change to DOM for animation propose
   */
  useHeight?: boolean,
  /**
   *  Indexs of items which need to be expanded after initialization
   */
  indexes?: number[];
};

interface CollapseElement { title: HTMLElement; content: HTMLElement; contentHeight?: number; active?: boolean; };

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
 * Collapse
 *
 * ### Example
 *
 * ```html
 * <section id="collapse">
 *   <div>
 *     <header>title 1</header>
 *     <article>content 1</article>
 *   </div>
 *   <div>
 *     <header>title 2</header>
 *     <article>content 2</article>
 *   </div>
 *   <div>
 *     <header>title 3</header>
 *     <article>content 3</article>
 *   </div>
 * </section>
 * ```
 *
 * ```javascript
 * const collapse = new Collapse(document.getElementById('collapse'), {
 *   selectors: {
 *     title: 'header', // by default
 *     content: 'article' // by default
 *   },
 *   event: 'click', // by default
 *   useHeight: true, // by default
 *   classes: { active: 'active' },
 *   accordion: true,
 *   indexes: [1],
 * });
 * collapse.on('collapse', (content, title) => {});
 * collapse.on('expand', (content, title) => {});
 * ```
 */
export class Collapse extends EventEmitter {
  host: HTMLElement;
  private config: CollapseConfig;
  private items: Array<CollapseElement> = [];
  private busy: boolean;

  /**
   * Modify the default configuration
   */
  static config(config: CollapseConfig, pure?: boolean): CollapseConfig {
    const ret = mergeDefault(defaults, config) as CollapseConfig;

    if (pure) return ret;
    else defaults = ret;
  }

  /**
   * Cconstructor
   *
   * @param element -
   * @param config - CollapseConfig
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

  /**
   * Toggle display the specified item
   *
   * @param index -
   */
  toggle(index: number): void {
    const item = this.items[index];

    if (item)
      this[item.active ? 'collapse' : 'expand'](index);
  }

  /**
   * Collapse the specified item
   *
   * @param index -
   * @param directly - collapse directly without animation
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
   * Expand the specified item
   *
   * @param index
   * @param directly - expand directly without animation
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
   * Refresh list
   *
   * @param reset - rest status using initial configuration
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

  /**
   * Destroy instance, remove all listeners
   */
  destroy() {
    this.removeAllListeners();
    this.host = this.items = this.config = null;
  }
}
