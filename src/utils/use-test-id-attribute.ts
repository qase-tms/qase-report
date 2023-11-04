import { useMemo } from 'react';

type TestIdAttribute = {
  'data-testid'?: string;
};

export const createTestId = (namespace: string, marker: string): string => {
  return `${namespace}__${marker}`;
};

export const useTestIdAttribute = (testId?: string): TestIdAttribute => {
  const testIdAttibute = useMemo(() => {
    if (!testId) {
      return {};
    }
    return {
      ['data-testid']: testId,
    };
  }, [testId]);
  return testIdAttibute;
};
