import { formatMs } from 'utils/time';

describe('formatMs', () => {
    it('Negative values formats to _', () => {
        expect(formatMs(-4)).toBe('_');
    });

    it('0 should be formatted to 0ms', () => {
        expect(formatMs(0)).toBe('0ms');
    });
    it('365 should be formatted to 365ms', () => {
        expect(formatMs(365)).toBe('365ms');
    });
    it('55_000 should be formatted to 55s 0ms', () => {
        expect(formatMs(55_000)).toBe('55s 0ms');
    });
    it('65_000 should be formatted to 1m 5s 0ms', () => {
        expect(formatMs(65_000)).toBe('1m 5s 0ms');
    });
    it('60_023 should be formatted to 1m 0s 23ms', () => {
        expect(formatMs(60_023)).toBe('1m 0s 23ms');
    });
    it('3600_023 should be formatted to 1h 0m 0s 23ms', () => {
        expect(formatMs(3600_023)).toBe('1h 0m 0s 23ms');
    });
    it('3720_023 should be formatted to 1h 2m 0s 23ms', () => {
        expect(formatMs(3720_023)).toBe('1h 2m 0s 23ms');
    });
    it('3605_023 should be formatted to 1h 0m 5s 23ms', () => {
        expect(formatMs(3605_023)).toBe('1h 0m 5s 23ms');
    });
    it('3600_023 should be formatted to 1h 0m 0s 23ms', () => {
        expect(formatMs(3600_023)).toBe('1h 0m 0s 23ms');
    });
    it('3600_000 should be formatted to 1h 0m 0s 0ms', () => {
        expect(formatMs(3600_000)).toBe('1h 0m 0s 0ms');
    });
});