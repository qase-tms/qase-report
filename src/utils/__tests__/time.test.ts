import { formatSeconds } from 'utils/time';

describe('formatSeconds', () => {
    it('Negative values formats to _', () => {
        expect(formatSeconds(-4)).toBe('_');
    });

    it('0 should be formatted to 0h 0m 0s', () => {
        expect(formatSeconds(0)).toBe('0h 0m 0s');
    });
    it('65 should be formatted to 0h 1m 5s', () => {
        expect(formatSeconds(65)).toBe('0h 1m 5s');
    });
    it('3645 should be formatted to 1h 0m 45s', () => {
        expect(formatSeconds(3645)).toBe('1h 0m 45s');
    });
});