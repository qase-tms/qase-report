import { FC, useState, useCallback } from 'react';
import offsetStyles from 'common-styles/offsets.module.css';
import { Spacer, SpacerDirections } from 'components/spacer/spacer';
import { TestPreviewItem } from 'widgets/test-preview-item/test-preview-item';
import { useTestPreviewList } from 'domain/hooks/use-test-preview-list';
import { TestDetails } from 'widgets/test-details/test-details';
import cn from 'classnames';
import { TestPreview } from 'src/domain/model/test-model';

export const TestsPreviewList: FC = () => {
  const tests = useTestPreviewList();
  const [activeTestId, setActiveTestId] = useState<string|null>(null);
  const handleTestSelection = useCallback((test: TestPreview) => {
    setActiveTestId(test.id);
  }, []);
  return (
    <>
    {activeTestId && <TestDetails testId={activeTestId} />}
    <Spacer className={cn(offsetStyles['padding-16-16'], offsetStyles['max-width-900'])} direction={SpacerDirections.Column}>
      {tests.map((test) => (
        <TestPreviewItem key={test.id} test={test} onSelect ={handleTestSelection} />
      ))}
    </Spacer>
    </>
  );
}