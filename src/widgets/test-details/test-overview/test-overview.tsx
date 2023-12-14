import { FC } from 'react';
import { Test } from 'domain/model/test-model';
import { TestDetailsDescription } from '../test-details-description';
import { TestDetailsSummary } from '../test-details-summary';
import { TestAttachments } from 'widgets/test-attachments';
import { TestSteps } from 'widgets/test-steps';

type Props = {
  test: Test;
};

export const TestOverview: FC<Props> = ({ test }) => {
  return (
    <>
      <TestDetailsSummary
        duration={test.execution.duration}
        thread={test.execution.thread}
        endTime={test.execution.end_time}
      />
      {test.fields.description && <TestDetailsDescription description={test.fields.description} />}
      {Boolean(test.attachments.length) && <TestAttachments attachments={test.attachments} />}
      {Boolean(test.steps.length) && <TestSteps steps={test.steps} />}
    </>
  );
};
