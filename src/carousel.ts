import { bindOnce, css, EventEmitter, forEach, isTouch, mergeDefaults, transitionend, xProperty } from './utils';

interface CarouselStyle {
  /**
   * Class name which applied to current slide
   */
  active: string;
  /**
   * Class name which applied to current indicator
   */
  indicatorActive?: string;
}

interface CarouselConfig {
  /**
   * CSS selectors for quering carousel item
   */
  selectors?: {
    item: string;
    indicator?: string;
  };
  /**
   * Class names
   */
  classes?: CarouselStyle;
  /**
   *  Slide speed in ms
   */
  speed?: number;
  /**
   *  Loop mode
   */
  continuous?: boolean;
  /**
   * Threshold to determine if the slide is valid (0-1)
   */
  threshold?: number;
  /**
   * Resistance (0-1)
   */
  resistance?: number;
  /**
   *  Index of slide which need to be showed after initialization
   */
  index?: number;
  /**
   *  Autoplay
   */
  auto?: boolean;
  /**
   *  Dely for autoplay in ms
   */
  delay?: number;
}

/** @ignore */
interface CarouselElement { el: HTMLElement; index: number; };

/** @ignore */
const Events: { [type: string]: string | string[] } = {
  slide: 'slide',
  slideChange: 'slideChange',
  ...(isTouch ? {
    start: 'touchstart',
    move: 'touchmove',
    end: ['touchend']
  } : {
      start: 'mousedown',
      move: 'mousemove',
      end: ['mouseup', 'mouseleave']
    })
};

/** @ignore */
let defaults: CarouselConfig = {
  selectors: {
    item: 'li',
  },
  delay: 4000,
  speed: 500,
  continuous: false,
  auto: false,
  index: 0,
  threshold: .4,
  resistance: .4,
  classes: {} as CarouselStyle,
};

/**
 * Carousel
 *
 * ### Example
 *
 * ```html
 * <section id="slide">
 *   <ul>
 *     <li>slide 1</li>
 *     <li>slide 2</li>
 *     <li>slide 3</li>
 *   <ul>
 * </section>
 * ```
 *
 * ```javascript
 * const slide = new Carousel(document.getElementById('slide'), {
 *   selectors: {
 *     item: 'li' // by default
 *   },
 *   speed: 500, // by default
 *   threshold: .4, // by default
 *   resistance: .4, // by default
 *   delay: 4000 // by default
 *   auto: true,
 *   index: 1,
 * });
 *
 * // triggered before slide
 * slide.on('slide', (current, next) => {})
 *
 * // triggered after slide
 * slide.on('slideChange', (current, previous) => {})
 * ```
 */
export class Carousel extends EventEmitter {
  host: HTMLElement;
  private config: CarouselConfig;
  private container: HTMLElement;
  private items: CarouselElement[] = [];
  private indicators: NodeListOf<Element>;
  private size: number;
  private step: number;
  private current = 0;
  private busy: boolean;
  private instance: any;
  private running: boolean;
  private offEvents: () => void;

  /**
   * Modify the default configuration
   */
  static config(config: CarouselConfig, pure?: boolean): CarouselConfig {
    const ret = mergeDefaults(defaults, config) as CarouselConfig;

    if (ret.auto) ret.continuous = true;
    if (ret.threshold < 0 || ret.threshold > 1) ret.threshold = defaults.threshold;
    if (ret.resistance < 0 || ret.resistance > 1) ret.resistance = defaults.resistance;
    if (!transitionend) ret.speed = 0;

    if (!ret.selectors.indicator || !ret.classes.indicatorActive) {
      delete ret.selectors.indicator;
      delete ret.classes.indicatorActive;
    }

    ret.resistance = 1 - ret.resistance;

    if (pure) return ret;
    else defaults = ret;
  }

  /**
   * Cconstructor
   *
   * @param element -
   * @param config - CarouselConfig
   */
  constructor(element: HTMLElement, config: CarouselConfig = {}) {
    super();
    this.config = Carousel.config(config, true);
    this.host = element;

    if (this.config.selectors.indicator) {
      const indicators = document.querySelectorAll(this.config.selectors.indicator);
      if (indicators) this.indicators = indicators;
    }

    this.setup();
    this.offEvents = this.setupEvents();

    if (this.config.auto) this.start();
  }

  /**
   * Requery all slide items
   */
  setup(): void {
    const container = this.host.querySelector(this.config.selectors.item).parentElement;
    const items: CarouselElement[] = [];
    const width = container.offsetWidth;

    forEach(container.children, (el: HTMLElement, index) => {
      css(el, {
        width: width + 'px',
        cssFloat: 'left',
      } as CSSStyleDeclaration)
      items.push({ el, index });
    });

    css(container, {
      overflow: 'hidden',
      width: width * items.length + 'px'
    } as CSSStyleDeclaration);

    this.container = container;
    this.items = items;
    this.size = items.length;
    this.step = width;

    this.move(this.config.index, 0);
  }

  private setupEvents() {
    const self = this;
    const start = { x: 0, y: 0 }, delta = { x: 0, y: 0 };
    const continuous = self.config.continuous && self.size > 2;
    const events: {
      map: { [type: string]: string; };
      handleEvent: (event: TouchEvent | MouseEvent) => void;
      start: (event: TouchEvent | MouseEvent) => void;
      move: (event: TouchEvent | MouseEvent) => void;
      end: (event: TouchEvent | MouseEvent) => void;
    } = {
      map: {},
      handleEvent(this: any, event) {
        if (self.busy) return;
        const handler = this[this.map[event.type]];
        if (handler) handler(event);
      },
      start(event) {
        const touches = isTouch ? (<TouchEvent>event).touches[0] : <MouseEvent>event;
        start.x = touches.pageX;
        start.y = touches.pageY;

        if (self.config.auto) self.stop.call(self);

        bindEvents(<string>Events.move, ...(<string[]>Events.end));
      },
      move(event) {
        if ((<TouchEvent>event).touches && (<TouchEvent>event).touches.length > 1) return;
        const touches = isTouch ? (<TouchEvent>event).touches[0] : <MouseEvent>event;

        delta.x = touches.pageX - start.x;
        delta.y = touches.pageY - start.y;

        if (Math.abs(delta.x) >= Math.abs(delta.y)) {
          // less than this.step so the transitionEnd event can be triggered
          const limit = self.step - 1;
          let offset = delta.x * self.config.resistance;
          if (offset > limit) {
            offset = limit;
          } else if (offset < -limit) {
            offset = -limit;
          }
          self.translate(self.current * self.step - offset, 0);
        }
      },
      end() {
        const threshold = self.step * self.config.threshold;
        const speed = Math.ceil(self.config.speed / self.step * Math.abs(delta.x));

        offEvents(<string>Events.move, ...(<string[]>Events.end));

        if (delta.x > threshold) {
          if (continuous || self.current > 0)
            self.prev().then(() => {
              if (self.config.auto) self.start.call(self);
            });
          else {
            self.translate(self.current * self.step, speed);
          }
        } else if (delta.x < -threshold) {
          if (continuous || self.current < self.size - 1) {
            self.next().then(() => {
              if (self.config.auto) self.start.call(self);
            });
          } else {
            self.translate(self.current * self.step, speed);
          }
        } else {
          self.translate(self.current * self.step, speed);
        }
      }
    };
    const listenerOptions = <any>{ passive: false };

    for (const key in Events) {
      const t = Events[key];
      if (typeof t === 'string')
        events.map[t] = key;
      else
        t.forEach(t => events.map[t] = key);
    }

    bindEvents(<string>Events.start);

    return function () {
      offEvents(<string>Events.start, <string>Events.move, ...(<string[]>Events.end));
    }

    function bindEvents(...types: string[]) {
      types.forEach(t => self.container.addEventListener(t, events, listenerOptions));
    }
    function offEvents(...types: string[]) {
      types.forEach(t => self.container.removeEventListener(t, events, listenerOptions));
    }
  }

  private translate(dist: number, speed: number): void {
    const transform = `translateX(${~~(-dist)}px)`;
    const transitionDuration = speed + 'ms';

    css(this.container, {
      [xProperty('transform')]: transform,
      [xProperty('transitionDuration')]: transitionDuration,
    } as any);
  }

  /**
   * Move to a position with transition
   *
   * @param to - The index number to slide to
   * @param speed - CSS transitionDuration in ms
   */
  private move(to: number, speed: number): Promise<boolean> {
    if (this.busy || to < 0 || to > this.size - 1) return Promise.resolve(false);

    // save current index before items array changed
    const current = (this.current === to && to === 0) ? 0 : this.items[this.current].index;
    const continuous = this.config.continuous && this.size > 2;
    const classes = this.config.classes;
    this.busy = true;

    if (classes.active)
      this.items[this.current].el.classList.remove(classes.active);

    let next: number;
    if (continuous) {
      // determine if it's out of bounds the next move
      if (to === 0) {
        this.items.unshift(this.items.pop());
        next = 1;
      } else if (to === this.size - 1) {
        this.items.push(this.items.shift());
        next = this.size - 2;
      } else next = to;
    } else next = to;

    // the origin index of the next slide
    const itemNext = this.items[next].index;

    // active indicator if possible
    if (this.indicators) {
      this.indicators[current] && this.indicators[current].classList.remove(this.config.classes.indicatorActive);
      this.indicators[itemNext] && this.indicators[itemNext].classList.add(this.config.classes.indicatorActive);
    }

    // emit ongoing event, pass current, next index
    setTimeout(() => {
      this.emit<number, number>(<string>Events.slide, current, itemNext);
    }, 0);

    this.translate(to * this.step, speed);

    if (speed > 0)
      return new Promise(resolve => {
        bindOnce(this.container, transitionend, () => {
          cb.call(this, function () {
            resolve(true);
          })
        });
      })
    else return cb.call(this) as any;

    function cb(this: any, fn?: () => void) {
      if (classes.active)
        this.items[next].el.classList.add(classes.active);

      // sync
      if (continuous) {
        if (to === 0) {
          this.container.insertBefore(this.container.children[this.size - 1], this.container.children[0]);
          this.translate(this.step, 0);
        } else if (to === this.size - 1) {
          this.container.appendChild(this.container.children[0]);
          this.translate(this.step * (to - 1), 0);
        }
      }

      this.current = next;
      this.busy = false;

      setTimeout(() => {
        // emit ongoing event, pass current, previous index
        this.emit(Events.slideChange, this.items[next].index, current);
        fn && fn();
      }, 0)
    }
  }

  /**
   * Slide to item
   *
   * @param index
   */
  slide(index: number): Promise<boolean> {
    if (index < 0 || index > this.size - 1 || this.busy) return Promise.resolve(false);

    let i = 0;
    while (i < this.size) {
      if (this.items[i].index === index) return this.move(i, this.config.speed);
      i++;
    }
  }

  /**
   * Slide to next
   */
  next(): Promise<boolean> {
    return this.move((this.size < 3 && this.current === this.size - 1) ? 0 : this.current + 1, this.config.speed);
  }

  /**
  * Slide to previous
  */
  prev(): Promise<boolean> {
    return this.move((this.size < 3 && this.current === 0) ? this.size - 1 : this.current - 1, this.config.speed);
  }

  /**
   * Autoplay
   */
  start(): void {
    if (this.running || this.size < 3) return;
    this.stop();
    this.running = true;

    const fn = () => {
      if (this.running) this.instance = setTimeout(() => {
        this.next().then(fn);
      }, this.config.delay);
    };

    fn();
  }

  /**
   * Stop autoplay
   */
  stop(): void {
    clearInterval(this.instance);
    this.instance = null;
    this.running = false;
  }

  /**
   * Destroy instance, remove all listeners
   */
  destroy(): void {
    this.offEvents();
    this.removeAllListeners();
    this.stop();
    this.host = this.items = this.container = null;
  }
}
