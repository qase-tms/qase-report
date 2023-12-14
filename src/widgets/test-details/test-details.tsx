import { FC, useEffect, useState } from 'react';
import { useTestDetails } from 'domain/hooks/tests-hooks/use-test-details';
import { RequestStatus } from 'utils/use-request';
import { Text } from 'components/text';
import { createTestId } from 'utils/use-test-id-attribute';
import { TestStatusField } from 'widgets/test-status-field';
import {
  CardSubHeader,
  PanelHeader,
  Container,
  DetailsPanel,
  TabsSlot,
} from './text-details-styled';
import { devLogger } from 'utils/dev-logger';
import { TestOverview } from './test-overview';
import { Tab, Tabs } from 'components/tabs';
import { TestStackTrace } from './test-stacktrace';

type TestDetailsProps = {
  qaseTestId: string;
};

const testIdNamespace = 'WIDGET_TEST_DETAILS';

export const testIds = {
  errorField: createTestId(testIdNamespace, 'error-field'),
  subHeaderTitle: createTestId(testIdNamespace, 'subheader-title'),
};

enum TestDetailsTab {
  Overview = 'overview',
  Stacktrace = 'stacktrace',
}

const testDetailsTabs: Tab<TestDetailsTab>[] = [
  {
    id: TestDetailsTab.Overview,
    text: 'Overview',
  },
  {
    id: TestDetailsTab.Stacktrace,
    text: 'Stacktrace',
  },
];

export const TestDetails: FC<TestDetailsProps> = ({ qaseTestId }) => {
  const { test, testRequestStatus } = useTestDetails(qaseTestId);

  const [tab, setTab] = useState<TestDetailsTab>(TestDetailsTab.Overview);

  useEffect(() => {
    if (testRequestStatus === RequestStatus.Success && test) {
      devLogger.log(`Inspect test details #${test.id}`, test);
    }
  }, [test, testRequestStatus]);

  return (
    <>
      {testRequestStatus === RequestStatus.Failed && (
        <Text size={Text.Size.L1} color={Text.Color.Red} testId={testIds.errorField}>
          Something gone wrong...
        </Text>
      )}
      {test && testRequestStatus !== RequestStatus.Failed && (
        <Container>
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
          <TabsSlot>
            <Tabs tabs={testDetailsTabs} value={tab} onChange={setTab} />
          </TabsSlot>
          <DetailsPanel>
            {tab === TestDetailsTab.Overview && <TestOverview test={test} />}
            {tab === TestDetailsTab.Stacktrace && (
              <TestStackTrace stacktrace={test.execution.stacktrace} />
            )}
          </DetailsPanel>
        </Container>
      )}
    </>
  );
};
