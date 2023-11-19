import { TestPreview } from 'domain/model/test-model';

export type Filters = {
  search?: string;
};

export const normalizeString = (str: string) => str.trim().toLowerCase().replaceAll(/\s+/g, ' ');

export function isStringMatchSearch(str: string, search: string) {
  return normalizeString(str).includes(normalizeString(search));
}

function searchPredicate(test: TestPreview, search?: string) {
  return !search || isStringMatchSearch(test.title, search);
}

export const filterTests = (tests: TestPreview[], filters: Filters): TestPreview[] => {
  return tests.filter(test => {
    return searchPredicate(test, filters.search);
  });
};
