import { bindTransition, css, delegate, EventEmitter, forEach, mergeDefaults, pick, redraw, transitionend, xProperty } from './utils';

interface CollapsibleStyle {
  /** CSS class name of the title element when expanded */
  titleActive: string;
  /** CSS class name of the content element when expanded */
  contentActive: string;
};

interface CollapsibleConfig {
  /**
   * CSS selector for querying title and content elements
   */
  selectors?: {
    /**
     * Title element selector
     *
     * @default `header`
     */
    title?: string;

    /**
     * Content element selector
     *
     * @default `article`
     */
    content?: string;
  };

  /** CSS class name */
  classes?: CollapsibleStyle;

  /**
   * The type of event that is bound on the title to trigger expand/collapse
    *
    * @default `click`
   */
  event?: string;

  /**
   * Accordion mode
   *
   * @default false
   */

  accordion?: boolean;

  /**
   * Whether to use animation
   *
   * @default true
   */
  animation?: boolean;

  /**
   * Animation duration in ms
   *
   * @default 300
   */
  duration?: number,

  /**
   * Items that need to be expanded after initialization,
   * all are collapsed by default
   */
  index?: number | number[];
};

interface CollapsibleSnapshot {
  /** Title element */
  title: HTMLElement;

  /** Content element */
  content: HTMLElement;

  /** Index */
  index: number;
};

/** @ignore */
interface CollapsibleElement {
  title: HTMLElement;
  content: HTMLElement;
  contentHeight?: number;
  expanded?: boolean;
  busy: boolean;
  index: number;
};

/** @ignore */
const EVENTS = {
  expand: 'expand',
  collapse: 'collapse'
}

/** @ignore */
let defaults: CollapsibleConfig = {
  selectors: {
    title: 'header',
    content: 'article',
  },
  classes: {} as CollapsibleStyle,
  event: 'click',
  accordion: false,
  animation: true,
  duration: 300
}

/**
 * ## Collapsible
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
 * const collapsible = new Collapsible(
 *   document.getElementById('collapse')
 * );
 *
 * collapsible.on('collapse', ({title, content, index}) => {});
 * collapsible.on('expand', ({title, content, index}) => {});
 * ```
 */
export class Collapsible extends EventEmitter {
  private _config: CollapsibleConfig;
  private _items: Array<CollapsibleElement> = [];
  private _removeDelegate: any;

  /**
   * Modify the default configuration
   */
  static config(config: CollapsibleConfig, pure?: boolean): CollapsibleConfig {
    const ret = mergeDefaults(defaults, config) as CollapsibleConfig;

    if (!Array.isArray(ret.index)) ret.index = [ret.index];
    ret.index = ret.index.filter(i => typeof i === 'number');
    if (!transitionend) ret.animation = false;
    if (!(ret.duration > 1)) ret.duration = defaults.duration;

    if (pure) return ret;
    else defaults = ret;
  }

  /**
   * @param host container element
   * @param config
   */
  constructor(public host: HTMLElement, config?: CollapsibleConfig) {
    super();
    this._config = Collapsible.config(config || {}, true);

    this.refresh(true);

    this._removeDelegate = delegate.bind(this.host)(this._config.event, this._config.selectors.title, (target: HTMLElement) => {
      const index = this._items.map(i => i.title).indexOf(target);
      const item = this._items[index];

      if (item && !item.busy) {
        if (this._config.accordion) this.collapse(this._items.filter(i => i !== item).map(i => i.index))
        this.toggle(index);
      };
    });
  }

  /**
   * Toggle item
   *
   * @param index
   * @param direct toggle directly without transition
   * @returns return promise if animation is enabled
   */
  toggle(index: number | number[], direct?: boolean): void | Promise<void> {
    const indexes = index = Array.isArray(index) ? index : [index];
    const items = this._items.filter((item, i) =>
      ~indexes.indexOf(i) &&
      !item.busy
    );
    const classes = this._config.classes;

    if (!items.length) return;

    if (!this._config.animation || direct) {
      items.forEach(item => {
        const expanded = !item.expanded;
        item.expanded = expanded;
        classes.titleActive && item.title.classList[expanded ? 'add' : 'remove'](classes.titleActive);
        classes.contentActive && item.content.classList[expanded ? 'add' : 'remove'](classes.contentActive);

        item.content.style.display = expanded ? '' : 'none';
        redraw(item.content);

        this.emit<CollapsibleSnapshot>(
          expanded ? EVENTS.expand : EVENTS.collapse,
          pick(item, ['content', 'title', 'index'])
        );
      });

      return;
    }

    return new Promise(resolve => {
      let count = items.length;
      items.forEach(item => {
        const expanded = !item.expanded;
        const maxHeight = item.contentHeight + 'px'

        item.expanded = expanded;
        item.busy = true;

        if (expanded) {
          css(item.content, {
            display: '',
            maxHeight: 0,
            paddingTop: 0,
            paddingBottom: 0
          } as any);
          redraw(item.content);
          css(item.content, {
            maxHeight,
            paddingTop: '',
            paddingBottom: ''
          } as any);
        } else {
          css(item.content, {
            maxHeight
          } as any);
          redraw(item.content);
          css(item.content, {
            maxHeight: 0,
            paddingTop: 0,
            paddingBottom: 0
          } as any);
        }
        css(item.content, {
          [xProperty('transitionDuration')]: this._config.duration + 'ms',
          [xProperty('transitionProperty')]: 'max-height,padding-top,padding-bottom',
        } as any);

        bindTransition(item.content, 'max-height', () => {
          // reset
          css(item.content, {
            maxHeight: '',
            paddingTop: '',
            paddingBottom: '',
            [xProperty('transitionDuration')]: '',
            [xProperty('transitionProperty')]: '',
          } as any);

          if (!expanded) {
            item.content.style.display = 'none';
            redraw(item.content);
          }

          if (count === 1) resolve();
          else if (--count < 1) resolve();

          item.busy = false;
          this.emit<CollapsibleSnapshot>(
            expanded ? EVENTS.expand : EVENTS.collapse,
            pick(item, ['content', 'title', 'index'])
          );
        });
      });
    })
  }

  /**
   * Collapse item
   *
   * @param index
   * @param direct collapse directly without animation
   * @returns return promise if animation is enabled
   */
  collapse(index: number | number[], direct?: boolean): void | Promise<void> {
    const indexes = Array.isArray(index) ? index : [index];

    return this.toggle(
      this._items
        .filter((item, i) => ~indexes.indexOf(i) && item.expanded)
        .map(i => i.index),
      direct);
  }

  /**
   * Expand item
   *
   * @param index
   * @param direct expand directly without animation
   * @returns return promise if animation is enabled
   */
  expand(index: number | number[], direct?: boolean): void | Promise<void> {
    const indexes = Array.isArray(index) ? index : [index];

    return this.toggle(
      this._items
        .filter((item, i) => ~indexes.indexOf(i) && !item.expanded)
        .map(i => i.index),
      direct);
  }

  /**
   * Refresh
   *
   * @param reset Expand the specified items with initial configuration
   */
  refresh(reset: boolean) {
    const titles = this.host.querySelectorAll(this._config.selectors.title);
    const contents = this.host.querySelectorAll(this._config.selectors.content);
    const items: CollapsibleElement[] = [];
    const initIndex: number[] = reset ? <number[]>this._config.index : this._items.filter(i => i.expanded).map(i => i.index);
    let index = 0;

    forEach(titles, (title, i) => {
      const content = contents[i] as HTMLElement;

      if (!content) return;

      const t = {
        index: index++,
        title,
        content,
        expanded: true,
        busy: false,
      } as CollapsibleElement;

      if (this._config.animation)
        t.contentHeight = content.offsetHeight;

      items.push(t);
    });

    this._items = items;

    if (reset) {
      const collapseIndexes = items.filter(i => !~initIndex.indexOf(i.index)).map(i => i.index);
      return this.toggle(collapseIndexes, true) as void;
    }
  }

  /**
   * Destroy instance, remove all listeners
   */
  destroy() {
    this._removeDelegate();
    this.removeAllListeners();
    this.host = this._items = this._config = null;
  }
}
