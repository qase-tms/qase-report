import * as jsonpResolvers from '../jsonp-resolvers';
import { qaseJsonp } from '../qase-jsonp';

describe('qaseJsonp', () => {
  it('calls resolver by script[data-callback-id]', () => {
    const jsonpResolver = jest.fn();
    const getJsonpResolver = jest.fn().mockImplementation(() => jsonpResolver);
    const resolverId = 'testid';
    const data = {
      test: 'test data',
    };

    jest.spyOn(jsonpResolvers, 'getJsonpResolver').mockImplementationOnce(getJsonpResolver);
    Object.defineProperty(document, 'currentScript', {
      value: {
        dataset: {
          callbackId: resolverId,
        },
      },
    });

    qaseJsonp(data);
    expect(getJsonpResolver).toBeCalledWith(resolverId);
    expect(jsonpResolver).toBeCalledWith(data);
  });
});
