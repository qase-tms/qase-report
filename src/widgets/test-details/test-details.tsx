import { FC } from 'react';
import { Spacer } from 'components/spacer';
import { TestDetailsCard } from './test-details-card';
import { TestDetailsSummary } from './test-details-summary';
import { useTestDetails } from 'domain/hooks/tests-hooks/use-test-details';
import { RequestStatus } from 'utils/use-request';
import { Text } from 'components/text';
import { createTestId } from 'utils/use-test-id-attribute';
import { TestStatusField } from 'widgets/test-status-field';

type TestDetailsProps = {
  qaseTestId: string;
};

const testIdNamespace = 'WIDGET_TEST_DETAILS';

export const testIds = {
  errorField: createTestId(testIdNamespace, 'error-field'),
};

const headerCss = `
    padding: 0 16px;
    max-width: 500px;
    margin: 16px 0 8px;
`;

export const TestDetails: FC<TestDetailsProps> = ({ qaseTestId }) => {
  const { test, testRequestStatus } = useTestDetails(qaseTestId);

  return (
    <Spacer fullHeight>
      {testRequestStatus === RequestStatus.Failed && (
        <Text size={Text.Size.L1} color={Text.Color.Red} testId={testIds.errorField}>
          Something gone wrong...
        </Text>
      )}
      {test && testRequestStatus !== RequestStatus.Failed && (
        <Spacer fullHeight direction={Spacer.Direction.Column} align={Spacer.Align.Start}>
          <TestStatusField status={test.execution.status} css={headerCss} withText />
          <Spacer fullHeight direction={Spacer.Direction.Row}>
            <TestDetailsCard title={test.title} description={test.fields.description} />
            <TestDetailsSummary
              duration={test.execution.duration}
              thread={test.execution.thread}
              endTime={test.execution.end_time}
            />
          </Spacer>
        </Spacer>
      )}
    </Spacer>
  );
};
