import { FC, useCallback } from 'react';
import offsetStyles from 'common-styles/offsets.module.css';
import { Spacer, SpacerDirections } from 'components/spacer/spacer';
import { TestPreviewItem } from 'widgets/test-preview-item/test-preview-item';
import { TestDetails } from 'widgets/test-details/test-details';
import cn from 'classnames';
import { TestPreview } from 'src/domain/model/test-model';
import styles from './tests-preview-list.module.css';
import { useTestsLayout } from 'domain/hooks/test-preivew-list-hooks/use-tests-layout';


export const TestsPreviewList: FC = () => {
  const { tests, activeTestId, setActiveTestId } = useTestsLayout();
  const handleTestSelection = useCallback((test: TestPreview) => {
    setActiveTestId(test.id);
  }, []);
  return (
    <>
    {activeTestId && <TestDetails qaseTestId={activeTestId} />}
    <Spacer className={cn(offsetStyles['padding-16-16'], offsetStyles['max-width-900'], styles.item)} direction={SpacerDirections.Column}>
      {tests.map((test) => (
        <TestPreviewItem key={test.id} test={test} onSelect={handleTestSelection} />
      ))}
    </Spacer>
    </>
  );
}