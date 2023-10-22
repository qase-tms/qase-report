import { FC, useState, useEffect } from 'react';
import { SidePanel } from "components/side-panel/side-panel";
import { Spacer, SpacerAlign, SpacerDirections } from 'components/spacer/spacer';
import commonStyles from 'common-styles/offsets.module.css';
import { TestDetailsHeader } from './test-details-header/test-details-header';
import { TestDetailsCard } from './test-details-card/test-details-card';
import { TestDetailsSummary } from './test-details-summary/test-details-summary';
import { useTestDetails } from 'domain/hooks/use-test-details';
import { RequestStatus } from 'domain/api/use-request';
import { Text, TextColor, TextSizes } from 'components/text/text';

type TestDetailsProps = {
    testId: string;
}

export const TestDetails: FC<TestDetailsProps> = ({ testId }) => {
    const { test, testRequestStatus} = useTestDetails(testId);
    const [panelOpened, setPanelOpened] = useState<boolean>(false);

    useEffect(() => {
        if(panelOpened) {
            if([RequestStatus.Idle, RequestStatus.Loading].includes(testRequestStatus)) {
                setPanelOpened(false);
            }
        } else {
            if([RequestStatus.Success, RequestStatus.Failed].includes(testRequestStatus)) {
                setPanelOpened(true);
            }
        }
    }, [testRequestStatus]);
    
    return (
        <SidePanel opened={panelOpened}>
            {testRequestStatus === RequestStatus.Failed && (
                <Text size={TextSizes.L1} color={TextColor.Error}>Something gone wrong...</Text>
            )}
            {test && testRequestStatus !== RequestStatus.Failed  && (
                            <Spacer fullHeight direction={SpacerDirections.Column} align={SpacerAlign.Start}>
                            <TestDetailsHeader status={test.execution.status} className={commonStyles['margin-bottom-8']} />
                            <Spacer fullHeight direction={SpacerDirections.Row}>
                                <TestDetailsCard title={test.title} description={test.fields.description} />
                                <TestDetailsSummary duration={test.execution.duration} thread={test.execution.thread} endTime={test.execution.end_time} />
                            </Spacer>
                        </Spacer>
            )}
        </SidePanel>
    );
};