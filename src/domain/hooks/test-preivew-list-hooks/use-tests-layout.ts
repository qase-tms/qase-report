import { useState, useEffect } from 'react';
import { useTestPreviewList } from './use-test-preview-list';
import { TestPreview } from 'src/domain/model/test-model';

type TestsLayoutShape = {
    tests: TestPreview[],
    activeTestId: string|null,
    setActiveTestId: (id: string) => void
};

export const useTestsLayout = ():TestsLayoutShape => {
  const tests = useTestPreviewList();
  const [activeTestId, setActiveTestId] = useState<string|null>(null);
  useEffect(() => {
    if(tests.length && !activeTestId) {
      setActiveTestId(tests[0].id);
    }
  }, [tests, activeTestId]);
  return { tests, activeTestId, setActiveTestId};
};