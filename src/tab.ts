import { delegate, EventEmitter, forEach, mergeDefaults, redraw } from './utils';

interface TabStyle {
  /** CSS class name of current tab */
  active?: string;
}

interface TabConfig {
  /**
   * CSS selectors for quering tab and content elements
   */
  selectors?: {
    /**
     * Tab element selector
     *
     * @default `a`
     */
    tab?: string;

    /**
     * Content element selector
     *
     * @default `article`
     */
    content?: string;
  }
  /**
   *  Index of tab need to be actived after initialization
   */
  index?: number;

  /** CSS class name */
  classes?: TabStyle;

  /**
   * The type of event that is bound on the tab to trigger switch
    *
    * @default `click`
   */
  event?: string;
}

interface ActivatedTabSnapshot {
  /** Current tab element */
  tab: HTMLElement;

  /** Current content element */
  content: HTMLElement;

  /** current tab index */
  current: number;

  /** previous tab index */
  previous: number;
}

/** @ignore */
const EVENTS = {
  switch: 'switch'
}

/** @ignore */
let defaults: TabConfig = {
  selectors: {
    tab: 'a',
    content: 'article'
  },
  classes: {},
  event: 'click',
  index: 0,
}

/**
 * ## Tab
 *
 * ### Example
 *
 * ```html
 * <section id="tab">
 *   <nav>
 *     <a>tab 1</a>
 *     <a>tab 2</a>
 *     <a>tab 3</a>
 *   </nav>
 *   <article>content 1</article>
 *   <article>content 2</article>
 *   <article>content 3</article>
 * </section>
 * ```
 *
 * ```javascript
 * const tab = new Tab(document.getElementById('tab'));
 *
 * tab.on('switch', ({title, content, current, previous}) => {})
 * ```
 */
export class Tab extends EventEmitter {
  private _config: TabConfig;
  private _current: number;
  private _tabs: HTMLElement[] = [];
  private _contents: HTMLElement[] = [];
  private _removeDelegate: any;

  /**
   * Modify the default configuration
   */
  static config(config: TabConfig, pure?: boolean): TabConfig {
    const ret = mergeDefaults(defaults, config) as TabConfig;

    if (pure) return ret;
    else defaults = ret;
  }

  /**
   * @param host container element
   * @param config
   */
  constructor(public host: HTMLElement, config?: TabConfig) {
    super();
    this._config = Tab.config(config || {}, true);

    this.refresh(this._config.index);

    this._removeDelegate = delegate.bind(this.host)(this._config.event, this._config.selectors.tab, (target: HTMLElement) => {
      const index = this._tabs.indexOf(target);
      if (~index) this.switch(index);
    });
  }

  /**
   * Switch to a specified index
   *
   * @param index
   */
  switch(index: number) {
    if (index === this._current || !this._tabs[index]) return;

    const current = this._current;
    const classes = this._config.classes;
    const currentTab = this._tabs[current];
    const currentContent = this._contents[current];
    const tab = this._tabs[index];
    const content = this._contents[index];

    if (classes.active) {
      currentTab && currentTab.classList.remove(classes.active);
      tab.classList.add(classes.active);
    }
    if (currentContent)
      currentContent.style.display = 'none';
    content.style.display = '';
    redraw(content);
    this._current = index;

    this.emit<ActivatedTabSnapshot>(EVENTS.switch, {
      tab, content,
      current: index,
      previous: current
    });
  }

  /**
   * Refresh tab list, and switch to a specified index
   *
   * @param index
   */
  refresh(index: number) {
    const tabs = this.host.querySelectorAll(this._config.selectors.tab) as NodeListOf<HTMLElement>;
    const contents = this.host.querySelectorAll(this._config.selectors.content) as NodeListOf<HTMLElement>;

    forEach(tabs, (tab: HTMLElement, i) => {
      const content = contents[i];

      if (content) {
        content.style.display = 'none';
        this._tabs.push(tab);
        this._contents.push(content)
      }
    });

    this.switch(index);
  }

  /**
   * Destroy tab instance, remove all listeners
   */
  destroy() {
    this._removeDelegate();
    this.removeAllListeners();
    this.host = this._tabs = this._contents = this._config = null;
  }
}
