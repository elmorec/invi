describe('modal', function () {
  const { Modal } = Invi;
  let uid = 0;

  beforeEach(function () {
    const id = `modal-${++uid}`;

    Modal.config({
      title: 'Modal ' + id,
      animation: true,
      content: id,
      classes: {
        host: id,
        backdrop: 'backdrop',
        body: 'body',
      }
    });

    this.id = id;
    this.startAt = Date.now()
    this.duration = function () {
      return ~~((Date.now() - this.startAt) / 100) * 100
    }
  });

  it('open', async function () {
    const modal = new Modal();

    await modal.open();

    expect($('.' + this.id)[0]).toBeDefined();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('close', async function () {
    const modal = new Modal();

    await modal.open();
    await modal.close();

    expect($('.' + this.id)[0]).not.toBeDefined();
    expect(document.body.style.overflow).toBe('');
  });

  it('modal element', async function () {
    const modal = new Modal({
      autoclose: false
    });
    await modal.open();

    const modalHost = $('.' + this.id);

    expect(modal.host).toEqual(modalHost[0]);
    expect(modal.host.outerHTML).toBe(`<div class="${this.id}"><div class="backdrop"></div><div class="body"><header>${modal.config.title}</header><article>${this.id}</article></div></div>`);
  });

  it('actions', async function () {
    const modal = new Modal({
      actions: [
        { type: 'close', label: 'close' },
        { type: 'cancel', label: 'cancel' },
        { type: 'confirm', label: 'ok' },
        {
          label: 'search it',
          href: 'https://www.google.com/search?q=',
          target: '_blank',
        },
        {
          label: 'noop', callback: function () {
            foo.bar('noop');
          }
        },
      ]
    });
    const foo = { types: [] };
    foo.bar = function (type) { foo.types.push(type) };

    expect(modal.el.footer.children.length).toBe(5);
    expect(modal.el.footer.children[0].innerHTML).toBe('close');
    expect(modal.el.footer.children[1].innerHTML).toBe('cancel');
    expect(modal.el.footer.children[2].innerHTML).toBe('ok');

    expect(modal.el.footer.children[3].innerHTML).toBe('search it');
    expect(modal.el.footer.children[3].href).toBe('https://www.google.com/search?q=');
    expect(modal.el.footer.children[3].target).toBe('_blank');

    expect(modal.el.footer.children[4].innerHTML).toBe('noop');

    modal.on('cancel', () => foo.bar('cancel'));
    modal.on('confirm', () => foo.bar('confirm'));

    [0, 1, 2, 4].forEach(i => modal.el.footer.children[i].click());

    await sleep(100)
    expect(foo.types).toEqual(['cancel', 'confirm', 'noop']);
  });

  it('autoclose', async function () {
    const modal = new Modal();

    spyOn(modal, 'close');
    modal.host.querySelector('.backdrop').click();
    expect(modal.close).toHaveBeenCalled();
  });

  it('event', async function () {
    const modal = new Modal({ event: 'touchstart' });

    spyOn(modal, 'close');
    $('.backdrop', modal.host).trigger('touchstart');
    expect(modal.close).toHaveBeenCalled();
  });

  it('animation', async function () {
    let modal = new Modal({
      classes: {
        enter: 'enter',
      }
    });

    await new Promise(resolve => {
      const promise = modal.open();
      expect(modal.host.classList.contains('enter')).toBe(true)
      resolve(promise)
    })
    expect(modal.host.classList.contains('enter')).toBe(false)

    modal = new Modal({
      classes: {
        leave: 'leave',
      }
    });

    await modal.open();

    await new Promise(resolve => {
      const promise = modal.close();
      expect(modal.host.classList.contains('leave')).toBe(true)
      resolve(promise)
    });
    expect(modal.host.classList.contains('leave')).toBe(false)
  });
});
