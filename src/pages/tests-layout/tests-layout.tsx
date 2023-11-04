import { FC, useCallback } from 'react';
import { TestPreviewItem } from 'widgets/test-preview-item';
import { TestDetails } from 'widgets/test-details';
import { TestPreview } from 'domain/model/test-model';
import { useTestsLayout } from 'domain/hooks/tests-hooks/use-tests-layout';
import { SplitPane } from 'components/split-pane';
import { Layout, Panel, PanelContent } from './tests-layout-styled';

export const TestsLayout: FC = () => {
  const { tests, activeTestId, setActiveTestId } = useTestsLayout();

  const handleTestSelection = useCallback((test: TestPreview) => {
    setActiveTestId(test.id);
  }, []);
  return (
    <Layout>
      <SplitPane
        initialSizes={['auto', '40%']}
        minSizes={['600px', '650px']}
        renderLeft={() => (
          <Panel>
            <PanelContent>
              {tests.map(test => (
                <TestPreviewItem key={test.id} test={test} onSelect={handleTestSelection} />
              ))}
            </PanelContent>
          </Panel>
        )}
        renderRight={() => activeTestId && <TestDetails qaseTestId={activeTestId} />}
      />
    </Layout>
  );
};
