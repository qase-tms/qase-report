import { FC, useCallback } from 'react';
import { TestDetails } from 'widgets/test-details';
import { TestPreview } from 'domain/model/test-model';
import { useTestsLayout } from 'domain/hooks/tests-hooks/use-tests-layout';
import { TestPreviewList } from 'widgets/test-preview-list';
import { PageLayout } from 'components/page-layout';

const layoutTabs = [
  {
    id: 'tests',
    text: 'Tests',
  },
  {
    id: 'timeline',
    text: 'Timeline',
  },
  {
    id: 'issues',
    text: 'Issues',
  },
];

export const TestsLayout: FC = () => {
  const { tests, activeTestId, setActiveTestId } = useTestsLayout();

  const handleTestSelection = useCallback((test: TestPreview) => {
    setActiveTestId(test.id);
  }, []);

  return (
    <PageLayout
      tabs={layoutTabs}
      renderContent={() => <TestPreviewList tests={tests} onTestSelect={handleTestSelection} />}
      renderPanel={() => activeTestId && <TestDetails qaseTestId={activeTestId} />}
    />
  );
};
