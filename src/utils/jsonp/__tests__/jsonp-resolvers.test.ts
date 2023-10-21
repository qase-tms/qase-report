import { getJsonpResolver, registerJsonpResolver, unregisterJsonpResolver } from "../jsonp-resolvers"

describe('jsonpResolvers', () => {
    it('registered resolver will could be getting', () => {
        const listener = jest.fn();
        registerJsonpResolver('test1', listener);
        expect(getJsonpResolver('test1')).toBe(listener);
    });
    it('unregistered resolver could not be getting', () => {
        const listener = jest.fn();
        registerJsonpResolver('test2', listener);
        unregisterJsonpResolver('test2');
        expect(getJsonpResolver('test2')).toBe(undefined);
    });
});