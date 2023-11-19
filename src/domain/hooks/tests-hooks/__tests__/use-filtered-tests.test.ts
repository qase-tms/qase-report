import { mockTestsData } from 'constants/mock-tests-data';
import { useSearch } from 'domain/hooks/params-hooks/use-search';
import { useState } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useFilteredTests } from '../use-filtered-tests';

jest.mock('domain/hooks/params-hooks/use-search', () => ({
  useSearch: jest.fn(),
}));

jest.mock('use-debounce', () => ({
  useDebouncedCallback: jest.fn().mockImplementation(fn => fn),
}));

describe('use-filtered-tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all tests if search is empty', () => {
    (useSearch as jest.Mock).mockImplementation(() => {
      return [undefined, () => {}];
    });
    const { result } = renderHook(() => useFilteredTests(mockTestsData));
    expect(result.current.search).toBe(undefined);
    expect(result.current.filteredTests).toEqual(mockTestsData);
  });

  it('returns matched tests if search is not empty', () => {
    (useSearch as jest.Mock).mockImplementation(() => {
      return ['multinested', () => {}];
    });
    const { result } = renderHook(() => useFilteredTests(mockTestsData));
    expect(result.current.search).toBe('multinested');
    expect(result.current.filteredTests).toEqual([mockTestsData[0]]);
  });

  it('setSearch updates search and filteredTests', () => {
    (useSearch as jest.Mock).mockImplementation(() => {
      const [search, setSearch] = useState<string>('');
      return [search, setSearch];
    });
    const { result } = renderHook(() => useFilteredTests(mockTestsData));
    act(() => {
      result.current.setSearch('multinested');
    });
    expect(result.current.filteredTests).toEqual([mockTestsData[0]]);
    expect(result.current.search).toEqual('multinested');
  });
});
