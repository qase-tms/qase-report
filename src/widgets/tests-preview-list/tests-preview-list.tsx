import { FC } from 'react';
import offsetStyles from 'common-styles/offsets.module.css';
import { Spacer, SpacerDirections } from 'components/spacer/spacer';
import { TestPreviewItem } from 'widgets/test-preview-item/test-preview-item';
import { useTestPreviewList } from 'domain/hooks/use-test-preview-list';
import { TestDetails } from 'widgets/test-details/test-details';
import cn from 'classnames';

export const TestsPreviewList: FC = () => {
  const tests = useTestPreviewList();
  return (
    <>
    <Spacer className={cn(offsetStyles['padding-16-16'], offsetStyles['max-width-900'])} direction={SpacerDirections.Column}>
      {tests.map((test) => (
        <TestPreviewItem key={test.id} test={test} />
      ))}
    </Spacer>
    <TestDetails />
    </>
  );
}