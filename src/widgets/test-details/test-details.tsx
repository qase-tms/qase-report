import { FC } from 'react';
import { Spacer } from 'components/spacer';
import { TestDetailsHeader } from './test-details-header';
import { TestDetailsCard } from './test-details-card';
import { TestDetailsSummary } from './test-details-summary';
import { useTestDetails } from 'domain/hooks/tests-hooks/use-test-details';
import { RequestStatus } from 'utils/use-request';
import { Text } from 'components/text';
import { createTestId } from 'utils/use-test-id-attribute';

type TestDetailsProps = {
    qaseTestId: string;
};

const testIdNamespace = 'WIDGET_TEST_DETAILS';

export const testIds = {
    errorField: createTestId(testIdNamespace, 'error-field')
};

export const TestDetails: FC<TestDetailsProps> = ({ qaseTestId }) => {
    const { test, testRequestStatus} = useTestDetails(qaseTestId);
    
    return (
        <Spacer fullHeight>
            {testRequestStatus === RequestStatus.Failed && (
                <Text size={Text.Size.L1} color={Text.Color.Error} testId={testIds.errorField}>Something gone wrong...</Text>
            )}
            {test && testRequestStatus !== RequestStatus.Failed  && (
                        <Spacer fullHeight direction={Spacer.Direction.Column} align={Spacer.Align.Start}>
                            <TestDetailsHeader status={test.execution.status} css={`margin: 16px 0 8px;`} />
                            <Spacer fullHeight direction={Spacer.Direction.Row}>
                                <TestDetailsCard title={test.title} description={test.fields.description} />
                                <TestDetailsSummary duration={test.execution.duration} thread={test.execution.thread} endTime={test.execution.end_time} />
                            </Spacer>
                        </Spacer>
            )}
        </Spacer>
    );
};