describe('utils', function () {
  const { xProperty } = Invi;
  it('xProperty', function () {
    expect(xProperty('fontSize')).toBe('fontSize');
    expect(xProperty('transform')).toBe('transform');
  })
});
