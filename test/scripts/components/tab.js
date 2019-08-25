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
    Tab.config({ classes: { active: id } });

    this.id = id;
  });

  it('active', function () {
    const tab = new Tab(createDOM());
    const id = this.id;

    return runQueue([1, 2, 1, 0], i => tab._tabs[i].click(), function (i) {
      const idxs = [0, 1, 2];
      expect(tab._tabs[i].classList.contains(id)).toBeTruthy();
      idxs.splice(idxs.indexOf(i), 1);
      idxs.forEach(i => {
        expect(tab._tabs[i].classList.contains(id)).toBeFalsy();
      });
    });
  });

  it('index', function () {
    const tab = new Tab(createDOM(), { index: 2 });

    expect(tab._contents[0].style.display).toBe('none');
    expect(tab._contents[1].style.display).toBe('none');
    expect(tab._contents[2].style.display).toBe('');
  });

  it('event', function () {
    const tab = new Tab(createDOM(), { event: 'touchstart' });

    $(tab._tabs[2]).trigger('touchstart');

    expect(tab._contents[0].style.display).toBe('none');
    expect(tab._contents[1].style.display).toBe('none');
    expect(tab._contents[2].style.display).toBe('');
  });

  it('emit', function (done) {
    const tab = new Tab(createDOM());

    tab.on('switch', function ({ tab: _tab, content, current, previous }) {
      expect(_tab).toBe(tab._tabs[2]);
      expect(content).toBe(tab._contents[2])
      expect(current).toBe(2);
      expect(previous).toBe(0);
      done();
    });
    tab._tabs[2].click();
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

    expect(tab._tabs.length).toBe(2);
    expect(tab._contents.length).toBe(2);
    expect(tab._contents[0].style.display).toBe('');
    expect(tab._contents[1].style.display).toBe('none');

    tab._tabs[1].click();
    expect(tab._contents[0].style.display).toBe('none');
    expect(tab._contents[1].style.display).toBe('');
  });
});
