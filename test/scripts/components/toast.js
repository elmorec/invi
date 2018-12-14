describe('toast', function () {
  const { toast } = Invi;
  let uid = 0;

  beforeEach(function () {
    const id = `toast-${++uid}`;
    toast.config({
      content: id,
      classes: { host: id }
    });

    this.id = id;
  });

  it('accept html', function () {
    toast({ content: `<div id="toast-content">${this.id}</div>`, unsafe: true });
    expect($(`.${this.id} #toast-content`)[0]).toBeDefined();
  });

  it('duration', async function () {
    const ts = Date.now();
    await toast({ duration: 500 });
    expect((Date.now() - ts) / 100).toBeCloseTo(5, 0);
  });

  it('host', function () {
    const toastHost = $('<div>')[0];
    document.body.appendChild(toastHost);
    toast({ host: toastHost });
    expect($('.' + this.id, toastHost)[0]).toBeDefined();
  });

  it('animation:false', async function () {
    const ts = Date.now();
    const t = toast({ classes: { enter: 'enter', leave: 'leave' }, duration: 500, animation: false });
    expect($('.' + this.id)[0]).toBeDefined();
    await t;
    expect((Date.now() - ts) / 100).toBeCloseTo(5, 0);
    expect($('.' + this.id)[0]).not.toBeDefined();
  });

  it('animation:true', async function () {
    let ts = Date.now();
    await toast({ classes: { enter: 'enter' }, duration: 500 }).then(() => {
      expect((Date.now() - ts) / 100).toBeCloseTo(10, 0);
      expect($('.' + this.id)[0]).not.toBeDefined();
    });
  });

  it('animation:true', async function () {
    let ts = Date.now();
    ts = Date.now();
    await toast({ classes: { leave: 'leave' }, duration: 500 }).then(() => {
      expect((Date.now() - ts) / 100).toBeCloseTo(10, 0);
      expect($('.' + this.id)[0]).not.toBeDefined();
    });
  });

  it('animation:true', async function () {
    let ts = Date.now();
    await toast({ classes: { enter: 'enter', leave: 'leave' }, duration: 500 }).then(() => {
      expect((Date.now() - ts) / 100).toBeCloseTo(15, 0);
      expect($('.' + this.id)[0]).not.toBeDefined();
    });
  });
});
