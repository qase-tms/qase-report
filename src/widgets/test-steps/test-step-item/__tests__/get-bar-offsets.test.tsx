import { getBarsOffsets } from '../get-bars-offset';

describe('getBarOffsets', () => {
  it('Returns empty array on 0 depth', () => {
    expect(getBarsOffsets(0)).toEqual([]);
  });
  it('Returns [-24] on 1 depth', () => {
    expect(getBarsOffsets(1)).toEqual([-24]);
  });
  it('Returns [-24, -60] on 2 depth', () => {
    expect(getBarsOffsets(2)).toEqual([-24, -60]);
  });
});
