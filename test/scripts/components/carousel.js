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
    this.id = id;
    Carousel.config({ classes: { active: this.id } });
  });

  it('speed', async function () {
    const carousel = new Carousel(createDOM(), { speed: 1000 });
    const id = this.id;

    let t = Date.now();
    await carousel.next();
    expect((Date.now() - t) / 100).toBeCloseTo(10, 0);
  });

  it('delay', async function (done) {
    const carousel = new Carousel(createDOM(), { delay: 1000, auto: true, speed: 100 });
    const id = this.id;

    let t = Date.now();
    await sleep(100);
    carousel.on('slideChange', function () {
      expect((Date.now() - t) / 100).toBeCloseTo(11, 0);
      carousel.destroy();
      done();
    })
  });

  it('index', function () {
    const carousel = new Carousel(createDOM(), { index: 1 });
    const id = this.id;

    let t = Date.now();
    expect(carousel.host.querySelector('li[class^="carousel-"]').innerHTML).toBe('slide 2');
    expect(carousel.current).toBe(1);
  });

  it('continuous', async function () {
    const carousel = new Carousel(createDOM(), { continuous: true });
    const id = this.id;

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
    const id = this.id;

    let t = Date.now();
    await carousel.next();
    expect((Date.now() - t) / 100).toBeCloseTo(10, 0);
  });
});
