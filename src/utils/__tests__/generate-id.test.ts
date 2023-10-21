import { generateId } from 'utils/generate-id';

describe('generateId', () => {
    const mockedRandom = 0.14822301282782147;
    const mockedRandom10 = 1482230128;
    const mockedNow = 1697899405758;
    beforeEach(() => {
        jest.spyOn(global.Math, 'random').mockReturnValue(mockedRandom);
        jest.spyOn(global.Date, 'now').mockReturnValue(mockedNow);
    });

    it('generates concatinated string from Date.now, 10 random digits and source string', () => {
        const path = 'test/test_name';
        expect(generateId(path)).toBe(`${path}#${mockedRandom10}_${mockedNow}`);
    });
});