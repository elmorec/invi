import { EventEmitter } from 'eventemitter3';
import { delegate, mergeDefault, transitionEnd } from '../utils';

export interface TabStyle {
  active?: string;
}

export interface TabConfig {
  selectors?: {
    tab?: string;
    content?: string;
  }
  /**
   *  index of tab which need to be actived after initialization
   */
  index?: number;
  classes?: TabStyle;
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
 * @export
 * @class Tab
 * @extends {EventEmitter}
 * @example
 * <tab>
 *   <nav>
 *     <a>tab 1</a>
 *     <a>tab 2</a>
 *     <a>tab 3</a>
 *   </nav>
 *   <div>
 *     <section>content 1</section>
 *     <section>content 2</section>
 *     <section>content 3</section>
 *   </div>
 * </tab>
 *
 * const tab = new Tab(document.getElementById('tab'), {});
 * tab.on('switch', (tab, content, current, previous) => {});
 */
export class Tab extends EventEmitter {
  host: HTMLElement;
  private config: TabConfig;
  private current = 0;
  private tabs: Element[] = [];
  private contents: Element[] = [];

  static config(config: TabConfig, pure?: boolean): TabConfig {
    const ret = mergeDefault(defaults, config) as TabConfig;

    if (pure) return ret;
    else defaults = ret;
  }
  /**
   * Creates an instance of Tab.
   *
   * @param {HTMLElement} element
   * @param {TabConfig} [config={}]
   * @memberof Tab
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

  switch(index: number, force?: boolean) {
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

  refresh() {
    const tabs = this.host.querySelectorAll(this.config.selectors.tab);
    const contents = this.host.querySelectorAll(this.config.selectors.content);

    Array.from(tabs).forEach((tab, i) => {
      const content = contents[i] as HTMLElement;

      if (content) {
        content.style.display = 'none';
        this.tabs.push(tab);
        this.contents.push(content)
      }
    });

    this.switch(this.current, true);
  }

  destroy() {
    this.removeAllListeners();
    this.host = this.tabs = this.contents = this.config = null;
  }
}
