import { useMemo, FC, ReactNode } from 'react';

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

interface TestIdProps {
  testId?: string;
}

export function withTestId<T extends TestIdProps = TestIdProps>(Component: FC<T>): FC<T> {
  return ({ testId, ...rest }) => {
    const testIdAttributes = useTestIdAttribute(testId);
    return <Component {...(rest as T)} {...testIdAttributes} />;
  };
}
