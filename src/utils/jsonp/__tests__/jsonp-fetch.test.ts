import * as generateIdModule from 'utils/generate-id';
import * as jsonpResolvers from '../jsonp-resolvers';
import { jsonpFetch } from '../jsonp-fetch';

class FakeScript {
  private _resolve: () => void;

  constructor(resolve: () => void) {
    this._resolve = resolve;
  }

  private _src: string = '';

  public get src() {
    return this._src;
  }

  public set src(value: string) {
    this._src = value;
    this._resolve();
  }

  private _type: string = '';

  public get type() {
    return this._type;
  }

  public set type(value: string) {
    this._type = value;
  }

  private _async: boolean = false;
  public get async() {
    return this._async;
  }

  public set async(value: boolean) {
    this._async = value;
  }

  private _onerror: (d: unknown) => unknown = () => {};

  public get onerror() {
    return this._onerror;
  }

  public set onerror(value: (d: unknown) => unknown) {
    this._onerror = value;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setAttribute(name: string, value: unknown) {}
}

describe('jsonpFetch', () => {
  const mockedId = 'test-path#000_001';
  beforeEach(() => {
    jest.spyOn(generateIdModule, 'generateId').mockReturnValue(mockedId);
  });

  it('creates script tag with correct src, type, and data-callbackid', () => {
    jsonpFetch('test-path');
    const scriptElement: HTMLScriptElement = document.querySelector(
      '[data-callback-id="test-path#000_001"]',
    ) as HTMLScriptElement;
    expect(scriptElement.src.includes('test-path')).toBe(true);
    expect(scriptElement.type).toBe('text/javascript');
    expect(scriptElement.async).toBe(true);
  });

  it('returns data from jsonp in resolve', done => {
    const data = {
      test: 'test data',
    };

    let fakeResolve: (d: unknown) => void = () => {};
    const registerJsonpResolver = (key: string, resolve: (d: unknown) => void) => {
      fakeResolve = resolve;
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const unregisterJsonpResolver = (key: string) => {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getJsonpResolver = (key: string) => fakeResolve;

    jest
      .spyOn(document, 'createElement')
      //@ts-expect-error Fake script element
      .mockReturnValueOnce(new FakeScript(() => fakeResolve(data)));

    jest.spyOn(document.body, 'appendChild').mockImplementationOnce((node: Node) => node);
    jest.spyOn(document.body, 'removeChild').mockImplementationOnce((node: Node) => node);

    jest
      .spyOn(jsonpResolvers, 'registerJsonpResolver')
      .mockImplementationOnce(registerJsonpResolver);
    jest
      .spyOn(jsonpResolvers, 'unregisterJsonpResolver')
      .mockImplementationOnce(unregisterJsonpResolver);
    jest.spyOn(jsonpResolvers, 'getJsonpResolver').mockImplementationOnce(getJsonpResolver);

    jsonpFetch('test-path').then(result => {
      expect(result).toBe(data);
      done();
    });
  });
});
