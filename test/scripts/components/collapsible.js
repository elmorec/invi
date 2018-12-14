describe('collapsible', function () {
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
    this.id = id;
    Collapsible.config({ classes: { active: this.id }, useHeight: false, indexes: [-1] });
  });

  it('active', async function () {
    const id = this.id;
    const collapsible = new Collapsible(createDOM());

    await runQueue([0, 1, 2], i => collapsible.items[i].title.click(), function (i) {
      expect(collapsible.items[i].title.classList.contains(id)).toBeTruthy();
      expect(collapsible.items[i].content.classList.contains(id)).toBeTruthy();
      expect(collapsible.items[i].content.style.display).toBe('');
    });
    await runQueue([0, 1, 2], i => collapsible.items[i].title.click(), function (i) {
      expect(collapsible.items[i].title.classList.contains(id)).not.toBeTruthy();
      expect(collapsible.items[i].content.classList.contains(id)).not.toBeTruthy();
      expect(collapsible.items[i].content.style.display).toBe('none');
    });
  });

  it('index', function () {
    const collapsible = new Collapsible(createDOM(), { useHeight: false, indexes: [1, 2] });

    expect(collapsible.items[0].content.style.display).toBe('none');
    expect(collapsible.items[1].content.style.display).toBe('');
    expect(collapsible.items[2].content.style.display).toBe('');
  });

  it('event', function (done) {
    const collapsible = new Collapsible(createDOM(), { event: 'touchstart' });
    $(collapsible.items[0].title).trigger('touchstart');
    setTimeout(() => {
      expect(collapsible.items[0].content.style.display).toBe('');
      done();
    }, 0);
  });

  it('emit', function (done) {
    const collapsible = new Collapsible(createDOM());
    let count = 0;

    collapsible.items[0].title.click();
    collapsible.on('expand', (content, i) => {
      count++;
      expect(i).toBe(0);
      expect(content).toEqual(collapsible.items[i].content);
      expect(collapsible.items[i].content.style.display).toBe('');

      collapsible.items[0].title.click();
    });
    collapsible.on('collapse', (content, i) => {
      count++;
      expect(content).toEqual(collapsible.items[i].content);
      expect(collapsible.items[i].content.style.display).toBe('none');

      expect(count).toBe(2);
      done();
    });
  });

  it('accordion', async function () {
    const id = this.id;
    const collapsible = new Collapsible(createDOM(), { accordion: true });

    await runQueue([0, 1, 2], i => collapsible.items[i].title.click(), function (i) {
      const idxs = [0, 1, 2];
      expect(collapsible.items[i].content.style.display).toBe('');
      idxs.splice(idxs.indexOf(i), 1);
      idxs.forEach(i => {
        expect(collapsible.items[i].content.style.display).toBe('none');
      });
    });
    await runQueue([2], i => collapsible.items[i].title.click(), function (i) {
      [0, 1, 2].forEach(i => {
        expect(collapsible.items[i].content.style.display).toBe('none');
      });
    });
  });

  it('useHeight (transition)', async function () {
    const id = this.id;
    const collapsible = new Collapsible(createDOM(), { accordion: true, useHeight: true });

    await sleep(500);

    await collapsible.expand(1).then(o => {
      expect(o.title).toEqual(collapsible.items[1].title);
      expect(o.index).toBe(1);
    });

    await collapsible.collapse(1).then(o => {
      expect(o.title).toEqual(collapsible.items[1].title);
      expect(o.index).toBe(1);
    });
  });

  it('custom dom structure', function () {
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

    return runQueue([0, 1, 2], i => collapsible.items[i].title.click(), function (i) {
      expect(collapsible.items[i].title.classList.contains(id)).toBeTruthy();
      expect(collapsible.items[i].content.classList.contains(id)).toBeTruthy();
      expect(collapsible.items[i].content.style.display).toBe('');
    });
  });
});
