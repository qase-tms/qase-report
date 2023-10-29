import { FC, useCallback } from 'react';
import { Spacer } from 'components/spacer';
import { TestPreviewItem } from 'widgets/test-preview-item';
import { TestDetails } from 'widgets/test-details';
import { TestPreview } from 'domain/model/test-model';
import { useTestsLayout } from 'domain/hooks/tests-hooks/use-tests-layout';
import { SplitPane } from 'components/split-pane';
import styled from 'styled-components';

const listCss = `
    padding: 16px 16px;
    max-width: 900px;
`;

const Div = styled.div`
    height: calc(100vh - 50px);
`;

const ScrolledDiv = styled.div`
    overflow-y: scroll;
    max-height: calc(100vh - 50px);
`;

export const TestsLayout: FC = () => {
  const { tests, activeTestId, setActiveTestId } = useTestsLayout();

  const handleTestSelection = useCallback((test: TestPreview) => {
    setActiveTestId(test.id);
  }, []);
  return (
    <Div>
      <SplitPane
        initialSizes={['auto', '40%']}
        minSizes={['600px', '650px']}
        renderLeft={() => (
          <ScrolledDiv>
            <Spacer css={listCss} direction={Spacer.Direction.Column}>
              {tests.map((test) => (
                <TestPreviewItem key={test.id} test={test} onSelect={handleTestSelection} />
              ))}
            </Spacer>
          </ScrolledDiv>
        )}
        renderRight={() => (
          activeTestId && <TestDetails qaseTestId={activeTestId} />
        )} />
    </Div>
  );
} 