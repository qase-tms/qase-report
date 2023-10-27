import { FC, useCallback } from 'react';
import { Spacer, SpacerDirections } from 'components/spacer/spacer';
import { TestPreviewItem } from 'widgets/test-preview-item/test-preview-item';
import { TestDetails } from 'widgets/test-details/test-details';
import { TestPreview } from 'domain/model/test-model';
import { useTestsLayout } from 'domain/hooks/test-preivew-list-hooks/use-tests-layout';
import { SplitPane } from 'components/split-pane/split-pane';
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

export const TestsPreviewList: FC = () => {
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
            <Spacer css={listCss} direction={SpacerDirections.Column}>
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