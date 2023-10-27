import { FC, useCallback } from 'react';
import { Spacer, SpacerDirections } from 'components/spacer/spacer';
import { TestPreviewItem } from 'widgets/test-preview-item/test-preview-item';
import { TestDetails } from 'widgets/test-details/test-details';
import { TestPreview } from 'src/domain/model/test-model';
import { useTestsLayout } from 'domain/hooks/test-preivew-list-hooks/use-tests-layout';

const listCss = `
    padding: 16px 16px;
    max-width: 900px;
`;

export const TestsPreviewList: FC = () => {
  const { tests, activeTestId, setActiveTestId } = useTestsLayout();
  const handleTestSelection = useCallback((test: TestPreview) => {
    setActiveTestId(test.id);
  }, []);
  return (
    <>
    {activeTestId && <TestDetails qaseTestId={activeTestId} />}
    <Spacer css={listCss} direction={SpacerDirections.Column}>
      {tests.map((test) => (
        <TestPreviewItem key={test.id} test={test} onSelect={handleTestSelection} />
      ))}
    </Spacer>
    </>
  );
}