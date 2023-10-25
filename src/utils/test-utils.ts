
export const mockComponent = () => jest.fn().mockImplementation(() => null);

export const expectPropsPassed = (Component: jest.Mock, props: object) => {
    const callsidx = Component.mock.calls.length - 1;
    expect(Component.mock.calls[callsidx][0]).toMatchObject(props);
};