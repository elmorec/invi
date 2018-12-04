import { delegate, EventEmitter, forEach, mergeDefault } from '../utils';

interface TabStyle {
  /**
   * Class name which applied to current tab
   */
  active?: string;
}

interface TabConfig {
  /**
   * CSS selectors for quering tab and content element
   */
  selectors?: {
    tab?: string;
    content?: string;
  }
  /**
   *  Index of tab which need to be actived after initialization
   */
  index?: number;
  /**
   * Class names
   */
  classes?: TabStyle;
  /**
   * Event type
   */
  event?: string;
}

const Events = {
  switch: 'switch'
}
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
 * Tab
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
 * const tab = new Tab(document.getElementById('tab'), {
 *   classes: { active: 'active' },
 *   selectors: {
 *     tab: 'a', // by default
 *     content: 'article' // by default
 *   },
 *   event: 'click' // by default,
 *   index: 1,
 * });
 *
 * tab.on('switch', (
 *   tabElement, // current tab element
 *   contentElement, // current content element
 *   current, // current index
 *   previous // previous index
 * ) => {})
 * ```
 */
export class Tab extends EventEmitter {
  host: HTMLElement;
  private config: TabConfig;
  private current = 0;
  private tabs: Element[] = [];
  private contents: Element[] = [];

  /**
   * Modify the default configuration
   */
  static config(config: TabConfig, pure?: boolean): TabConfig {
    const ret = mergeDefault(defaults, config) as TabConfig;

    if (pure) return ret;
    else defaults = ret;
  }

  /**
   * Cconstructor
   *
   * @param element -
   * @param config - TabConfig
   */
  constructor(element: HTMLElement, config: TabConfig = {}) {
    super();
    this.config = Tab.config(config, true);
    this.host = element;

    this.refresh();

    delegate.bind(element)(this.config.event, this.config.selectors.tab, (target: HTMLElement) => {
      const index = this.tabs.indexOf(target);
      if (~index) this.switch(index);
    });
  }

  /**
   * Switch to the specified tab
   *
   * @param index -
   * @param force
   */
  switch(index: number, force?: boolean): void {
    if (index === this.current && !force || !this.tabs[index]) return;

    const classes = this.config.classes;
    const currentNav = this.tabs[this.current];
    const currentContent = this.contents[this.current] as HTMLElement;
    const tab = this.tabs[index];
    const content = this.contents[index] as HTMLElement;

    if (classes.active) {
      [currentNav, currentContent].forEach(el => el.classList.remove(classes.active));
      [tab, content].forEach(el => el.classList.add(classes.active));
    }

    currentContent.style.display = 'none';
    content.style.display = '';

    setTimeout(() => {
      this.emit(Events.switch, tab, content, index, this.current);
    }, 0);
    this.current = index;
  }

  /**
   * Refresh tab list
   */
  refresh(): void {
    const tabs = this.host.querySelectorAll(this.config.selectors.tab);
    const contents = this.host.querySelectorAll(this.config.selectors.content);

    forEach(tabs, (tab, i) => {
      const content = contents[i] as HTMLElement;

      if (content) {
        content.style.display = 'none';
        this.tabs.push(tab);
        this.contents.push(content)
      }
    });

    this.switch(this.current, true);
  }

  /**
   * Destroy instance, remove all listeners
   */
  destroy(): void {
    this.removeAllListeners();
    this.host = this.tabs = this.contents = this.config = null;
  }
}
