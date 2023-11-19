import { normalizeString, isStringMatchSearch } from 'utils/filter-tests';

describe('normalizeString', () => {
  it('normalizes to Lowercase', () => {
    expect(normalizeString('Test String')).toBe('test string');
  });
  it('trims string', () => {
    expect(normalizeString('  test ')).toBe('test');
  });
  it('zips multispaces', () => {
    expect(normalizeString('test  test    test')).toBe('test test test');
  });
});

describe('isStringMatchSearch', () => {
  it('matches substring search', () => {
    expect(isStringMatchSearch('Test item', 'item')).toBe(true);
  });
  it('matches substring search in different case', () => {
    expect(isStringMatchSearch('Test iTeM', 'ItEm')).toBe(true);
  });
  it('matches substring search with different spacing', () => {
    expect(isStringMatchSearch('Test item 3', 'item   3')).toBe(true);
  });
  it('matches substring search with side spaces', () => {
    expect(isStringMatchSearch('Test item', '  item   ')).toBe(true);
  });
  it('does not match search with different symbols', () => {
    expect(isStringMatchSearch('Test item', 'items')).toBe(false);
  });
});
