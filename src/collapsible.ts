import { bindOnce, delegate, EventEmitter, forEach, mergeDefaults, transitionend } from './utils';

interface CollapsibleStyle {
  /**
   * Class name which applied to the actived element
   */
  active: string;
};

interface CollapsibleConfig {
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
  classes?: CollapsibleStyle;
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
  animation?: boolean,
  /**
   *  Indexs of items which need to be expanded after initialization
   */
  indexes?: number[];
};

interface CollapsibleElement { title: HTMLElement; content: HTMLElement; contentHeight?: number; active?: boolean; busy: boolean; };

interface CollapsibleSnapshot {
  /**
   * current collapsed/expanded title element
   */
  title: HTMLElement;
  /**
   * current collapsed/expanded content element
   */
  content: HTMLElement;
  /**
   * index
   */
  index: number;
}

const renderDelay = 24;
const Events = {
  expand: 'expand',
  collapse: 'collapse'
}
let defaults: CollapsibleConfig = {
  selectors: {
    title: 'header',
    content: 'article',
  },
  classes: {} as CollapsibleStyle,
  event: 'click',
  indexes: [-1],
  accordion: false,
  animation: true
}

/**
 * Collapsible
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
 * const collapsible = new Collapsible(document.getElementById('collapse'), {
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
 * collapsible.on('collapse', (title, content, index) => {});
 * collapsible.on('expand', (title, content, index) => {});
 * ```
 */
export class Collapsible extends EventEmitter {
  host: HTMLElement;
  private config: CollapsibleConfig;
  private items: Array<CollapsibleElement> = [];

  /**
   * Modify the default configuration
   */
  static config(config: CollapsibleConfig, pure?: boolean): CollapsibleConfig {
    const ret = mergeDefaults(defaults, config) as CollapsibleConfig;

    if (!transitionend) ret.animation = false;

    if (pure) return ret;
    else defaults = ret;
  }

  /**
   * Cconstructor
   *
   * @param element -
   * @param config - CollapsibleConfig
   */
  constructor(element: HTMLElement, config: CollapsibleConfig = {}) {
    super();
    this.config = Collapsible.config(config, true);
    this.host = element;

    this.refresh(true);

    delegate.bind(element)(this.config.event, this.config.selectors.title, (target: HTMLElement) => {
      this.toggle(this.items.map(i => i.title).indexOf(target));
    });
  }

  /**
   * Toggle display the specified item
   *
   * @param index -
   * @returns promise
   */
  toggle(index: number): Promise<CollapsibleSnapshot> {
    const item = this.items[index];

    if (!item) return Promise.reject();
    return this[item.active ? 'collapse' : 'expand'](index) as any;
  }

  /**
   * Collapse the specified item
   *
   * @param index -
   * @param directly - collapse directly without animation (synchronize the operation)
   * @returns return a promise if directly is negative
   */
  collapse(index: number, directly?: boolean): Promise<CollapsibleSnapshot> | void {
    const item = this.items[index];
    const classes = this.config.classes;

    if (!item) return Promise.reject();
    if (!item.active || item.busy) return Promise.resolve({ title: item.title, content: item.content, index: index });

    item.active = false;
    classes.active && [item.title, item.content].forEach(el => el.classList.remove(classes.active));

    if (directly) {
      item.content.style.display = 'none';
      return;
    }

    item.busy = true;

    return new Promise(resolve => {
      if (this.config.animation) {
        item.content.style.maxHeight = item.contentHeight + 'px';
        setTimeout(() => {
          item.content.style.maxHeight = item.content.style.paddingTop = item.content.style.paddingBottom = '0';
        }, renderDelay);
        bindOnce(item.content, transitionend, () => {
          // reset
          item.content.style.display = 'none';
          item.content.style.maxHeight = item.content.style.paddingTop = item.content.style.paddingBottom = '';
          // safer resolve
          setTimeout(resolve, renderDelay);
        });
      } else {
        item.content.style.display = 'none';
        resolve();
      }
    }).then(() => {
      item.busy = false;
      this.emit(Events.collapse, item.content, index);

      return { title: item.title, content: item.content, index: index };
    });
  }

  /**
   * Expand the specified item
   *
   * @param index
   * @param directly - expand directly without animation (synchronize the operation)
   * @returns return a promise if directly is negative
   */
  expand(index: number, directly?: boolean): Promise<CollapsibleSnapshot> | void {
    const item = this.items[index];
    const classes = this.config.classes;

    if (!item) return Promise.reject();
    if (item.active || item.busy) return Promise.resolve({ title: item.title, content: item.content, index: index });

    item.active = true;
    classes.active && [item.title, item.content].forEach(el => el.classList.add(classes.active));

    if (directly) {
      item.content.style.display = '';
      if (this.config.accordion) {
        this.items.forEach((_, i) => index !== i && this.collapse(i, true));
      }
      return;
    }

    item.busy = true;

    return Promise.all([
      new Promise<void>(resolve => {
        if (this.config.animation) {
          // trigger transition
          item.content.style.maxHeight = item.content.style.paddingTop = item.content.style.paddingBottom = '0';
          item.content.style.display = '';
          setTimeout(() => {
            item.content.style.maxHeight = item.contentHeight + 'px';
            item.content.style.paddingTop = item.content.style.paddingBottom = '';
          }, renderDelay);
          bindOnce(item.content, transitionend, () => {
            // reset
            item.content.style.maxHeight = item.content.style.paddingTop = item.content.style.paddingBottom = '';
            // safer resolve
            setTimeout(resolve, renderDelay);
          });
        } else {
          item.content.style.display = '';
          resolve();
        }
      }).then(() => {
        item.busy = false;
        this.emit(Events.expand, item.content, index);
      })
    ].concat(this.config.accordion ? this.items.map((_, i) => index !== i ? this.collapse(i) as any : undefined) : undefined))
      .then(() => ({ title: item.title, content: item.content, index: index }));
  }

  /**
   * Refresh list
   *
   * @param reset - rest status using initial configuration
   * @returns promise
   */
  refresh(reset: boolean): void {
    const titles = this.host.querySelectorAll(this.config.selectors.title);
    const contents = this.host.querySelectorAll(this.config.selectors.content);
    const items: CollapsibleElement[] = [];

    forEach(titles, (title, i) => {
      const content = contents[i] as HTMLElement;

      if (!content) return;

      const t = { title, content, active: true, busy: false } as CollapsibleElement;

      if (this.config.animation)
        t.contentHeight = content.offsetHeight;

      items.push(t);
    })

    this.items = items;

    if (reset)
      items.map((_, i: number) => this[~this.config.indexes.indexOf(i) ? 'expand' : 'collapse'](i, true));
  }

  /**
   * Destroy instance, remove all listeners
   */
  destroy() {
    this.removeAllListeners();
    this.host = this.items = this.config = null;
  }
}
