import { useState, useEffect } from 'react';
import { useTestPreviewList } from './use-test-preview-list';
import { TestPreview } from 'domain/model/test-model';
import { useQaseTestId } from '../use-params';

type TestsLayoutShape = {
  tests: TestPreview[];
  activeTestId: string | null;
  setActiveTestId: (id: string) => void;
};

export const useTestsLayout = (): TestsLayoutShape => {
  const tests = useTestPreviewList();
  const [activeTestId, setActiveTestId] = useQaseTestId();
  useEffect(() => {
    if (tests.length && !activeTestId) {
      setActiveTestId(tests[0].id);
    }
  }, [tests, activeTestId]);
  return { tests, activeTestId: activeTestId ?? null, setActiveTestId };
};
