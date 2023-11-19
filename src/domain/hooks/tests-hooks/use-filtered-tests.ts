import { TestPreview } from 'domain/model/test-model';
import { useSearch } from 'domain/hooks/params-hooks/use-search';
import { useState, useEffect } from 'react';
import { Filters, filterTests } from 'utils/filter-tests';
import { useDebouncedCallback } from 'use-debounce';

type ReturnShape = {
  search?: string;
  setSearch: (search: string) => void;
  filteredTests: TestPreview[];
};

export const useFilteredTests = (tests: TestPreview[]): ReturnShape => {
  const [search, setSearch] = useSearch();
  const [searchState, setSearchState] = useState<string | undefined>(search);
  const [filteredTests, setFilteredTests] = useState<TestPreview[]>(tests);
  const debouncedSetSearch = useDebouncedCallback(setSearch, 300);

  useEffect(() => {
    setFilteredTests(filterTests(tests, { search }));
  }, [tests, search]);

  useEffect(() => {
    debouncedSetSearch(searchState || '');
  }, [searchState]);

  return { search: searchState, setSearch: setSearchState, filteredTests };
};
