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
    this.startAt = Date.now()
    this.duration = function() {
      return ~~((Date.now() - this.startAt) / 100) * 100
    }
  });

  it('accept html', function () {
    toast({ content: `<div id="toast-content">${this.id}</div>`, unsafe: true });
    expect($(`.${this.id} #toast-content`)[0]).toBeDefined();
  });

  it('duration', async function () {
    await toast({ duration: 500 });
    expect(this.duration()).toBeCloseTo(500);
  });

  it('host', function () {
    const toastHost = $('<div>')[0];
    document.body.appendChild(toastHost);
    toast({ host: toastHost });
    expect($('.' + this.id, toastHost)[0]).toBeDefined();
  });

  it('animation:false', async function () {
    const t = toast({ classes: { enter: 'enter', leave: 'leave' }, duration: 500, animation: false });
    expect($('.' + this.id)[0]).toBeDefined();
    await t;
    expect(this.duration()).toBeCloseTo(500);
    expect($('.' + this.id)[0]).not.toBeDefined();
  });

  it('animation:true enter', async function () {
    await toast({ classes: { enter: 'enter' }, duration: 500 })
    expect(this.duration()).toBeCloseTo(1000);
    expect($('.' + this.id)[0]).not.toBeDefined();
  });

  it('animation:true leave', async function () {
    await toast({ classes: { leave: 'leave' }, duration: 500 })
    expect(this.duration()).toBeCloseTo(1000);
    expect($('.' + this.id)[0]).not.toBeDefined();
  });

  it('animation:true enter/leave', async function () {
    await toast({ classes: { enter: 'enter', leave: 'leave' }, duration: 500 })
    expect(this.duration()).toBeCloseTo(1500);
    expect($('.' + this.id)[0]).not.toBeDefined();
  });
});
