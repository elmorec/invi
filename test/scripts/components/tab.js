describe('tab', function () {
  const { Tab } = Invi;
  const createDOM = () => {
    return $(`
    <section>
      <nav>
        <a>tab 1</a>
        <a>tab 2</a>
        <a>tab 3</a>
      </nav>
      <article>content 1</article>
      <article>content 2</article>
      <article>content 3</article>
    </section>`).appendTo(document.body)[0];
  }
  let uid = 0;

  beforeEach(function () {
    const id = `tab-${++uid}`;
    this.id = id;
    Tab.config({ classes: { active: this.id } });
  });

  it('active', function () {
    const tab = new Tab(createDOM());
    const id = this.id;

    return runQueue([1, 2, 1, 0], i => tab.tabs[i].click(), function (i) {
      const idxs = [0, 1, 2];
      expect(tab.tabs[i].classList.contains(id)).toBeTruthy();
      expect(tab.contents[i].classList.contains(id)).toBeTruthy();
      idxs.splice(idxs.indexOf(i), 1);
      idxs.forEach(i => {
        expect(tab.tabs[i].classList.contains(id)).toBeFalsy();
        expect(tab.contents[i].classList.contains(id)).toBeFalsy();
      });
    });
  });

  it('index', function () {
    const tab = new Tab(createDOM(), { index: 2 });

    expect(tab.contents[0].style.display).toBe('none');
    expect(tab.contents[1].style.display).toBe('none');
    expect(tab.contents[2].style.display).toBe('');
  });

  it('event', function () {
    const tab = new Tab(createDOM(), { event: 'touchstart' });

    $(tab.tabs[2]).trigger('touchstart');

    expect(tab.contents[0].style.display).toBe('none');
    expect(tab.contents[1].style.display).toBe('none');
    expect(tab.contents[2].style.display).toBe('');
  });

  it('emit', function (done) {
    const tab = new Tab(createDOM());
    tab.tabs[2].click();

    tab.on('switch', (tabElement, contentElement, current, previous) => {
      expect(tabElement).toEqual(tab.tabs[2]);
      expect(contentElement).toEqual(tab.contents[2]);
      expect(current).toBe(2);
      expect(previous).toBe(0);
      done();
    });
  });

  it('custom dom structure', function () {
    const tab = new Tab($(`
      <div>
        <nav>
          <p data-tab><span>tab 1</span></p>
          <p data-tab><span><span>tab 2</span></span></p>
          <p data-tab>tab 3</p>
        </nav>
        <div data-content>content 1</div>
        <div data-content>content 2</div>
      </div>
      `).appendTo(document.body)[0], {
        selectors: {
          tab: '[data-tab]',
          content: '[data-content]'
        }
      });

    expect(tab.tabs.length).toBe(2);
    expect(tab.contents.length).toBe(2);
    expect(tab.contents[0].style.display).toBe('');
    expect(tab.contents[1].style.display).toBe('none');

    tab.tabs[1].click();
    expect(tab.contents[0].style.display).toBe('none');
    expect(tab.contents[1].style.display).toBe('');
  });
});
