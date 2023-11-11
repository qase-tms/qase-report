import { FC } from 'react';
import { TestDetailsDescription } from './test-details-description';
import { TestDetailsSummary } from './test-details-summary';
import { useTestDetails } from 'domain/hooks/tests-hooks/use-test-details';
import { RequestStatus } from 'utils/use-request';
import { Text } from 'components/text';
import { createTestId } from 'utils/use-test-id-attribute';
import { TestStatusField } from 'widgets/test-status-field';
import { FlexColumn } from 'components/flex-column';
import { CardSubHeader, PanelHeader, Container } from './text-details-styled';

type TestDetailsProps = {
  qaseTestId: string;
};

const testIdNamespace = 'WIDGET_TEST_DETAILS';

export const testIds = {
  errorField: createTestId(testIdNamespace, 'error-field'),
  subHeaderTitle: createTestId(testIdNamespace, 'subheader-title'),
};

export const TestDetails: FC<TestDetailsProps> = ({ qaseTestId }) => {
  const { test, testRequestStatus } = useTestDetails(qaseTestId);

  return (
    <Container>
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
          <CardSubHeader>
            <Text
              size={Text.Size.L1}
              weight={Text.Weight.Semibold}
              tagName="h2"
              testId={testIds.subHeaderTitle}
            >
              {test.title}
            </Text>
          </CardSubHeader>
          <TestDetailsSummary
            duration={test.execution.duration}
            thread={test.execution.thread}
            endTime={test.execution.end_time}
          />
          {test.fields.description && (
            <TestDetailsDescription description={test.fields.description} />
          )}
        </FlexColumn>
      )}
    </Container>
  );
};
