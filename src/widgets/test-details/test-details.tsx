import { FC } from 'react';
import { TestDetailsCard } from './test-details-card';
import { TestDetailsSummary } from './test-details-summary';
import { useTestDetails } from 'domain/hooks/tests-hooks/use-test-details';
import { RequestStatus } from 'utils/use-request';
import { Text } from 'components/text';
import { createTestId } from 'utils/use-test-id-attribute';
import { TestStatusField } from 'widgets/test-status-field';
import { FlexColumn } from 'components/flex-column';
import { PanelContent, PanelHeader } from './text-details-styled';

type TestDetailsProps = {
  qaseTestId: string;
};

const testIdNamespace = 'WIDGET_TEST_DETAILS';

export const testIds = {
  errorField: createTestId(testIdNamespace, 'error-field'),
};

export const TestDetails: FC<TestDetailsProps> = ({ qaseTestId }) => {
  const { test, testRequestStatus } = useTestDetails(qaseTestId);

  return (
    <div>
      {testRequestStatus === RequestStatus.Failed && (
        <Text size={Text.Size.L1} color={Text.Color.Red} testId={testIds.errorField}>
          Something gone wrong...
        </Text>
      )}
      {test && testRequestStatus !== RequestStatus.Failed && (
        <FlexColumn>
          <PanelHeader>
            <TestStatusField status={test.execution.status} withText />
          </PanelHeader>
          <PanelContent>
            <TestDetailsCard title={test.title} description={test.fields.description} />
            <TestDetailsSummary
              duration={test.execution.duration}
              thread={test.execution.thread}
              endTime={test.execution.end_time}
            />
          </PanelContent>
        </FlexColumn>
      )}
    </div>
  );
};
