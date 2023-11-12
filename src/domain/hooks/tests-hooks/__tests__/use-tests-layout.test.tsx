import { useTestsLayout } from 'domain/hooks/tests-hooks/use-tests-layout';
import { useTestPreviewList } from 'domain/hooks/tests-hooks/use-test-preview-list';
import { mockTestsData } from 'constants/mock-tests-data';
import { renderHook, waitFor } from '@testing-library/react';
import { useQaseTestId } from 'domain/hooks/use-params';
import { useState } from 'react';

jest.mock('domain/hooks/tests-hooks/use-test-preview-list', () => {
  return { useTestPreviewList: jest.fn() };
});

jest.mock('domain/hooks/use-params', () => {
  return { useQaseTestId: jest.fn() };
});

describe('use-test-layout', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('activeTestId is null on no tests', () => {
    (useTestPreviewList as jest.Mock).mockImplementation(() => {
      return [];
    });
    (useQaseTestId as jest.Mock).mockImplementation(() => {
      const [activeTestId, setActiveTestId] = useState<string | null>(null);
      return [activeTestId, setActiveTestId];
    });
    const { result } = renderHook(useTestsLayout);
    expect(result.current.activeTestId).toBe(null);
    expect(result.current.tests.length).toBe(0);
  });

  it('activeTestId is id of first test', async () => {
    (useTestPreviewList as jest.Mock).mockImplementation(() => {
      return mockTestsData;
    });
    (useQaseTestId as jest.Mock).mockImplementation(() => {
      const [activeTestId, setActiveTestId] = useState<string | null>(null);
      return [activeTestId, setActiveTestId];
    });
    const { result } = renderHook(useTestsLayout);

    await waitFor(() => {
      expect(result.current.activeTestId).toBe(mockTestsData[0].id);
    });
  });
});
