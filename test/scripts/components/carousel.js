describe('Carousel', function () {
  const { Carousel } = Invi;
  const createDOM = () => {
    return $(`
      <carousel>
        <ul>
          <li>slide 1</li>
          <li>slide 2</li>
          <li>slide 3</li>
        </ul>
      </carousel>`).appendTo(document.body)[0];
  }
  let uid = 0;

  beforeEach(function () {
    const id = `carousel-${++uid}`;

    Carousel.config({ classes: { active: id } });

    this.id = id;
    this.startAt = Date.now()
    this.duration = function () {
      return ~~((Date.now() - this.startAt) / 100) * 100
    }
  });

  it('speed', async function () {
    const carousel = new Carousel(createDOM(), { speed: 1000 });

    await carousel.next();
    expect(this.duration()).toBeCloseTo(1000);
  });

  it('delay', async function (done) {
    const carousel = new Carousel(createDOM(), { delay: 1000, auto: true, speed: 100 });

    await sleep(100);
    carousel.on('slideChange', () => {
      expect(this.duration()).toBeCloseTo(1100);
      carousel.destroy();
      done();
    })
  });

  it('index', function () {
    const carousel = new Carousel(createDOM(), { index: 1 });

    expect(carousel.host.querySelector('li[class^="carousel-"]').innerHTML).toBe('slide 2');
    expect(carousel.current).toBe(1);
  });

  it('continuous', async function () {
    const carousel = new Carousel(createDOM(), { continuous: true });

    expect(carousel.host.querySelector('li[class^="carousel-"]').innerHTML).toBe('slide 1');
    await carousel.next();
    expect(carousel.host.querySelector('li[class^="carousel-"]').innerHTML).toBe('slide 2');
    await carousel.next();
    expect(carousel.host.querySelector('li[class^="carousel-"]').innerHTML).toBe('slide 3');
    await carousel.next();
    expect(carousel.host.querySelector('li[class^="carousel-"]').innerHTML).toBe('slide 1');
  });

  it('selectors', async function () {
    const carousel = new Carousel($(`
      <section>
        <div>
          <p data-slide>slide 1</p>
          <p data-slide>slide 2</p>
          <p data-slide>slide 3</p>
        <div>
      </section>
      `).appendTo(document.body)[0], {
        selectors: {
          item: '[data-slide]',
        }, speed: 1000
      });

    await carousel.next();
    expect(this.duration()).toBeCloseTo(1000);
  });
});
