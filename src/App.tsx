import { FC } from 'react';
import { Header } from 'widgets/header/header';
import {Spacer, SpacerDirections} from 'components/spacer/spacer';
import {TestPreviewItem} from 'widgets/test-preview-item/test-preview-item';
import { TestStatus } from 'domain/test';
import offsetStyles from 'common-styles/offsets.module.css';

const testsMock = [{
  id: '1',
  title: 'Quick case created from repository view',
  duration: 7275,
  status: TestStatus.Passed,
  thread: '1'
},
{
  id: '2',
  title: 'Quick case created from repository view Quick case created from repository view',
  duration: 725,
  status: TestStatus.Failed,
  thread: '1'
}

];

export const App: FC = () => {
  return (
    <>
    <Header />
    <Spacer className={offsetStyles['']} direction={SpacerDirections.Column}>
      {testsMock.map((test) => (
        <TestPreviewItem key={test.id} test={test} />
      ))}
      
    </Spacer>
    </>
  );
};