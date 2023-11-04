import { getTest } from 'domain/api/get-test';
import { RequestStatus, useRequest } from 'utils/use-request';
import { Test } from 'domain/model/test-model';
import { useCallback } from 'react';

type TestDetailsShape = {
  test: Test | null;
  testRequestStatus: RequestStatus;
};

export const useTestDetails = (testId: string): TestDetailsShape => {
  const handleGetTest = useCallback(
    (signal?: AbortSignal) => {
      return getTest(testId, signal);
    },
    [testId],
  );
  const { data, status } = useRequest<Test>(handleGetTest, [testId]);
  return { test: data, testRequestStatus: status };
};
