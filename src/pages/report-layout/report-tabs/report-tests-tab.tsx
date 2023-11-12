import { useTestsLayout } from 'domain/hooks/tests-hooks/use-tests-layout';
import { TestPreviewList } from 'widgets/test-preview-list';
import { useCallback, FC } from 'react';
import { TestPreview } from 'domain/model/test-model';
import { useQaseTestId } from 'domain/hooks/use-params';
import { TestDetails } from 'widgets/test-details';

export const ReportTestTabContent: FC = () => {
  const { tests, activeTestId, setActiveTestId } = useTestsLayout();

  const handleTestSelection = useCallback((test: TestPreview) => {
    setActiveTestId(test.id);
  }, []);

  return (
    <TestPreviewList tests={tests} onTestSelect={handleTestSelection} activeTestId={activeTestId} />
  );
};

export const ReportTestTabPanel: FC = () => {
  const [activeTestId] = useQaseTestId();
  return activeTestId ? <TestDetails qaseTestId={activeTestId} /> : null;
};
