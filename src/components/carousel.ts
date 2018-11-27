import { EventEmitter } from 'eventemitter3';
import { bindOnce, mergeDefault, css, transitionEnd, isTouch } from '../utils';

export interface CarouselStyle {
};

export interface CarouselConfig {
  selectors?: {
    item: string;
  };
  classes?: CarouselStyle;
  delay?: number;
  speed?: number;
  continuous?: boolean;
  threshold?: number;
  resistance?: number;
  /**
   *  index of slide which need to be showed after initialization
   */
  index?: number;
  auto?: boolean;
};
interface CarouselElement { el: HTMLElement; index: number; };

const Events = {
  slide: 'slide',
  slideChange: 'slideChange',
  ...(isTouch ? {
    start: 'touchstart',
    move: 'touchmove',
    end: ['touchend']
  } : {
      start: 'mousedown',
      move: 'mousemove',
      end: ['mouseup', 'mouseout']
    })
};

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
 * @export
 * @class Carousel
 * @extends {EventEmitter}
 * @example
 * <carousel>
 *   <div>
 *     <div>
 *       <header>title 1</header>
 *       <article>article 1</article>
 *     </div>
 *     <div>
 *       <header>title 1</header>
 *       <article>article 1</article>
 *     </div>
 *     <div>
 *       <header>title 1</header>
 *       <article>article 1</article>
 *     </div>
 *   <div>
 * </carousel>
 *
 * const carousel = new Carousel(document.getElementById('carousel'), {});
 * carousel.on('slide', (current, next) => {})
 * carousel.on('slideChange', (current, previous) => {})
 */
export class Carousel extends EventEmitter {
  host: HTMLElement;
  private config: CarouselConfig;
  private container: HTMLElement;
  private items: CarouselElement[] = [];
  private size: number;
  private step: number;
  private current = 0;
  private busy: boolean;
  private instance: any;
  private running: boolean;

  static config(config: CarouselConfig, pure?: boolean): CarouselConfig {
    const ret = mergeDefault(defaults, config) as CarouselConfig;

    if (ret.auto) ret.continuous = true;
    if (ret.threshold < 0 || ret.threshold > 1) ret.threshold = defaults.threshold;
    if (ret.resistance < 0 || ret.resistance > 1) ret.resistance = defaults.resistance;

    if (pure) return ret;
    else defaults = ret;
  }

  /**
   * Creates an instance of Carousel.
   *
   * @param {HTMLElement} element
   * @param {CarouselConfig} [config={}]
   * @memberof Carousel
   */
  constructor(element: HTMLElement, config: CarouselConfig = {}) {
    super();
    this.config = Carousel.config(config, true);
    this.host = element;

    this.setup();
    this.setupEvents();

    if (this.config.auto) this.start();
  }

  setup() {
    const container = this.host.querySelector(this.config.selectors.item).parentElement;
    const items: CarouselElement[] = [];
    const width = container.offsetWidth;

    Array.from(container.children).forEach((el: HTMLElement, index) => {
      css(el, {
        width: width + 'px',
        cssFloat: 'left',
      } as CSSStyleDeclaration)
      items.push({ el, index });
    });

    if (this.config.continuous && items.length === 2) {
      const c0 = items[0].el.cloneNode(true) as HTMLElement;
      const c1 = items[1].el.cloneNode(true) as HTMLElement;
      items.push({ el: c0, index: 0 }, { el: c1, index: 1 });
      container.appendChild(c0);
      container.appendChild(c1);
    }

    css(container, {
      overflow: 'hidden',
      width: width * items.length + 'px'
    } as CSSStyleDeclaration);

    this.container = container;
    this.items = items;
    this.size = items.length;
    this.step = width;

    this.slide(this.config.index, 0);
  }

  setupEvents() {
    const self = this;
    const start = { x: 0, y: 0 }, delta = { x: 0, y: 0 };
    const events = {
      map: {},
      handleEvent(event) {
        if (self.busy) return;
        const handler = this[this.map[event.type]];
        if (handler) handler(event);
      },
      start(event) {
        const touches = event.touches ? event.touches[0] : event;
        start.x = touches.pageX;
        start.y = touches.pageY;

        if (self.config.auto) self.stop.call(self);

        bindEvents(Events.move, ...Events.end);
      },
      move(event) {
        if (event.touches && (event.touches.length > 1 || event.scale && event.scale !== 1)) return;
        const touches = event.touches ? event.touches[0] : event;

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
          event.preventDefault();
          self.translate(self.current * self.step - offset, 0);
        }
      },
      end() {
        const threshold = self.step * self.config.threshold;
        const speed = Math.ceil(self.config.speed / self.step * Math.abs(delta.x));
        if (delta.x > threshold) {
          if (self.config.continuous || self.current > 0)
            self.prev().then(() => {
              if (self.config.auto) self.start.call(self);
            });
          else {
            self.translate(self.current * self.step, speed);
          }
        } else if (delta.x < -threshold) {
          if (self.config.continuous || self.current < self.size - 1) {
            self.next().then(() => {
              if (self.config.auto) self.start.call(self);
            });
          } else {
            self.translate(self.current * self.step, speed);
          }
        } else {
          self.translate(self.current * self.step, speed);
        }

        offEvents(Events.move, ...Events.end);
      }
    };

    for (const key in Events) {
      const t = Events[key];
      if (typeof t === 'string')
        events.map[t] = key;
      else
        t.forEach(t => events.map[t] = key);
    }

    bindEvents(Events.start);

    function bindEvents(...types) {
      types.forEach(t => self.container.addEventListener(t, events, { passive: false }));
    }
    function offEvents(...types) {
      types.forEach(t => self.container.removeEventListener(t, events));
    }
  }

  slide(to: number, speed: number): Promise<boolean> {
    if (to < 0 || to > this.size - 1 || this.busy) return Promise.resolve(false);

    return new Promise(resolve => {
      this.busy = true;
      // save current index before items array changed
      const current = (this.current === to && to === 0) ? undefined : this.items[this.current].index;

      let next;
      if (this.config.continuous) {
        // determine if it's out of bounds the next move
        if (to === 0) {
          this.items.unshift(this.items.pop());
          next = 1;
        } else if (to === this.size - 1) {
          this.items.push(this.items.shift());
          next = this.size - 2;
        } else next = to;
      } else next = to;

      // emit ongoing event, pass current, next index
      setTimeout(() => {
        this.emit(Events.slide, current, this.items[next].index);
      }, 0);

      this.translate(to * this.step, speed);

      if (speed > 0)
        bindOnce(this.container, transitionEnd, cb.bind(this));
      else setTimeout(() => cb.call(this), 0);

      function cb() {
        if (this.config.continuous) {
          // sync
          if (to === 0) {
            this.container.insertBefore(this.container.children[this.size - 1], this.container.children[0]);
            this.translate(this.step, 0);
          } else if (to === this.size - 1) {
            this.container.appendChild(this.container.children[0]);
            this.translate(this.step * (to - 1), 0);
          }
        }

        this.current = next;

        setTimeout(() => {
          this.busy = false;
          // emit ongoing event, pass current, previous index
          this.emit(Events.slideChange, this.items[this.current].index, current);
          resolve(true);
        }, 0)
      }
    })
  }

  private translate(dist, speed) {
    const transform = `translate3d(${(-dist).toFixed(3)}px, 0, 0)`;
    const transitionDuration = speed + 'ms';

    css(this.container, {
      transform, transitionDuration,
      webkitTransform: transform,
      webkitTransitionDuration: transitionDuration
    } as CSSStyleDeclaration);
  }

  next(): Promise<boolean> {
    return this.slide(this.current + 1, this.config.speed);
  }

  prev(): Promise<boolean> {
    return this.slide(this.current - 1, this.config.speed);
  }

  start() {
    if (this.running) return;
    this.stop();
    this.running = true;

    const fn = () => {
      if (this.running) this.instance = setTimeout(() => {
        this.next().then(() => {
          fn()
        });
      }, this.config.delay);
    };

    fn();
  }

  stop() {
    clearInterval(this.instance);
    this.instance = null;
    this.running = false;
  }

  destroy() {
    this.removeAllListeners();
    this.stop();
    this.host = this.items = this.container = null;
  }
}
