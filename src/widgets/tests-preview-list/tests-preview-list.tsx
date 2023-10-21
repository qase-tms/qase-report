import { FC, useState, useEffect } from 'react';
import offsetStyles from 'common-styles/offsets.module.css';
import { Spacer, SpacerDirections } from 'components/spacer/spacer';
import { TestPreviewItem } from 'widgets/test-preview-item/test-preview-item';
import { getTestPreviews } from 'domain/api/get-test-preview';
import { TestPreview } from 'src/domain/model/test-model';


export const TestsPreviewList: FC = () => {
  const [tests, setTests] = useState<TestPreview[]>([]);
  useEffect(() => {
    getTestPreviews()
    .then(testResults => {
      setTests(testResults.results);
    });
  }, []);
  return (
    <Spacer className={offsetStyles['padding-16-16']} direction={SpacerDirections.Column}>
      {tests.map((test) => (
        <TestPreviewItem key={test.id} test={test} />
      ))}
    </Spacer>
  )
}