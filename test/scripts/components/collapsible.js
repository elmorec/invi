describe('Collapsible', function () {
  const { Collapsible } = Invi;
  const createDOM = () => {
    return $(`
    <collapsible>
      <div>
        <header>title 1</header>
        <article>content 1</article>
      </div>
      <div>
        <header>title 2</header>
        <article>content 2</article>
      </div>
      <div>
        <header>title 3</header>
        <article>content 3</article>
      </div>
    </collapsible>`).appendTo(document.body)[0];
  }
  let uid = 0;

  beforeEach(function () {
    const id = `collapsible-${++uid}`;
    Collapsible.config({ classes: { titleActive: id, contentActive: id }, animation: false });

    this.id = id;
  });

  it('should be able to toggle active class', async function () {
    const id = this.id;
    const collapsible = new Collapsible(createDOM());

    await runQueue([0, 1, 2], i => collapsible._items[i].title.click(), function (i) {
      expect(collapsible._items[i].title.classList.contains(id)).toBeTruthy();
      expect(collapsible._items[i].content.classList.contains(id)).toBeTruthy();
      expect(collapsible._items[i].content.style.display).toBe('');
    });
    await runQueue([0, 1, 2], i => collapsible._items[i].title.click(), function (i) {
      expect(collapsible._items[i].title.classList.contains(id)).not.toBeTruthy();
      expect(collapsible._items[i].content.classList.contains(id)).not.toBeTruthy();
      expect(collapsible._items[i].content.style.display).toBe('none');
    });
  });

  it('should be able to expand the specific items duration initialization', function () {
    const collapsible = new Collapsible(createDOM(), { animation: false, index: [1, 2] });

    expect(collapsible._items[0].content.style.display).toBe('none');
    expect(collapsible._items[1].content.style.display).toBe('');
    expect(collapsible._items[2].content.style.display).toBe('');
  });

  it('should be able to change the default event type', function (done) {
    const collapsible = new Collapsible(createDOM(), { event: 'touchstart' });

    $(collapsible._items[0].title).trigger('touchstart');
    setTimeout(() => {
      expect(collapsible._items[0].content.style.display).toBe('');
      done();
    }, 0);
  });

  it('should be able to emit event properly', function (done) {
    const collapsible = new Collapsible(createDOM());
    let count = 0;

    collapsible.on('expand', ({ content, title, index }) => {
      count++;
      expect(index).toBe(0);
      expect(collapsible._items[index].content.style.display).toBe('');

      setTimeout(() => title.click());
    });
    collapsible.on('collapse', ({ content, index }) => {
      count++;
      expect(index).toBe(0);
      expect(collapsible._items[index].content.style.display).toBe('none');

      expect(count).toBe(2);
      done();
    });
    collapsible._items[0].title.click();
  });

  it('should be able use accordion mode', async function () {
    const id = this.id;
    const collapsible = new Collapsible(createDOM(), { accordion: true });

    await runQueue([0, 1, 2], i => collapsible._items[i].title.click(), function (i) {
      const idxs = [0, 1, 2];
      expect(collapsible._items[i].content.style.display).toBe('');
      idxs.splice(idxs.indexOf(i), 1);
      idxs.forEach(i => {
        expect(collapsible._items[i].content.style.display).toBe('none');
      });
    });
    await runQueue([2], i => collapsible._items[i].title.click(), function (i) {
      [0, 1, 2].forEach(i => {
        expect(collapsible._items[i].content.style.display).toBe('none');
      });
    });
  });

  it('should be able to use animation', async function () {
    const id = this.id;
    const collapsible = new Collapsible(createDOM(), { accordion: true, duration: 500, animation: true });

    await collapsible.expand(1)
    expect(collapsible._items[1].expanded).toBe(true);

    await collapsible.collapse(1)
    expect(collapsible._items[1].expanded).toBeFalsy();
  });

  it('should be able to change selectors', function () {
    const id = this.id;
    const collapsible = new Collapsible($(`
      <collapsible>
        <header data-title>title 1</header>
        <article data-content>content 1</article>
        <header data-title>title 2</header>
        <article data-content>content 2</article>
        <header data-title>title 3</header>
        <article data-content>content 3</article>
      </collapsible>
      `).appendTo(document.body)[0], {
        selectors: {
          title: '[data-title]',
          content: '[data-content]'
        }
      });

    return runQueue([0, 1, 2], i => collapsible._items[i].title.click(), function (i) {
      expect(collapsible._items[i].title.classList.contains(id)).toBeTruthy();
      expect(collapsible._items[i].content.classList.contains(id)).toBeTruthy();
      expect(collapsible._items[i].content.style.display).toBe('');
    });
  });
});
