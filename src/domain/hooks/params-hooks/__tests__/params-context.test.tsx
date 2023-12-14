import { TabId } from 'domain/model/tabs';
import { decodeParams, encodeParams } from '../params-context';

describe('decodeParams', () => {
  it('empty params decodes to object with undefined params', () => {
    const qe = new URLSearchParams();
    const params = decodeParams(qe);
    expect(params).toEqual({
      tabId: undefined,
      testId: undefined,
    });
  });
  it('unknown tabId paramsis omitted', () => {
    const qe = new URLSearchParams();
    qe.append('tabId', 'unknown_tab');
    const params = decodeParams(qe);
    expect(params).toEqual({
      tabId: undefined,
      testId: undefined,
    });
  });
  it('tabId params decodes to object with same tabId in params', () => {
    const qe = new URLSearchParams();
    qe.append('tabId', TabId.Tests);
    const params = decodeParams(qe);
    expect(params).toEqual({
      tabId: TabId.Tests,
      testId: undefined,
    });
  });
  it('tabId + testId params decodes to object with same tabId, testId in params', () => {
    const qe = new URLSearchParams();
    qe.append('tabId', TabId.Tests);
    qe.append('testId', '0001');
    const params = decodeParams(qe);
    expect(params).toEqual({
      tabId: TabId.Tests,
      testId: '0001',
    });
  });
  it('tabId + testId + search params decodes to object with same tabId, testId in params', () => {
    const qe = new URLSearchParams();
    qe.append('tabId', TabId.Tests);
    qe.append('testId', '0001');
    qe.append('search', 'test%20item');
    const params = decodeParams(qe);
    expect(params).toEqual({
      tabId: TabId.Tests,
      testId: '0001',
      search: 'test item',
    });
  });
});

describe('encodeParams', () => {
  it('empty params encodes to empty string', () => {
    const params = {};
    const search = encodeParams(params);
    expect(search).toBe('');
  });
  it('undefined params encodes to empty string', () => {
    const params = { tabId: undefined };
    const search = encodeParams(params);
    expect(search).toBe('');
  });
  it('params with tabId encodes to search string with tabId', () => {
    const params = { tabId: TabId.Tests };
    const search = encodeParams(params);
    expect(search).toBe('?tabId=tests');
  });
  it('params with tabId, testId encodes to search string with tabId, testId', () => {
    const params = { tabId: TabId.Tests, testId: '0001' };
    const search = encodeParams(params);
    expect(search).toBe('?tabId=tests&testId=0001');
  });
  it('params with tabId, testId, search encodes to search string with tabId, testId, search', () => {
    const params = { tabId: TabId.Tests, testId: '0001', search: '  test item' };
    const search = encodeParams(params);
    expect(search).toBe('?tabId=tests&testId=0001&search=test%20item');
  });
});
