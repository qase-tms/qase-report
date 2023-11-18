import { FC } from 'react';
import { Icon } from 'components/icon';
import { formatMs } from 'utils/time';
import { createTestId } from 'utils/use-test-id-attribute';
import { TestSummaryItem } from './tests-summary-item';
import styled from 'styled-components';

type TestDetailsSummaryProps = {
  duration: number;
  endTime: number;
  thread?: string;
};

const TestIdNamespace = 'TEST_DETAILS_SUMMARY';

export const testIds = {
  durationField: createTestId(TestIdNamespace, 'duration-field'),
  endTimeField: createTestId(TestIdNamespace, 'endTime-Field'),
  threadField: createTestId(TestIdNamespace, 'thread-field'),
};

const Section = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(50, 66, 95, 0.05);
  justify-content: space-between;
  width: 100%;
  border-radius: 6px;
  box-sizing: border-box;
`;

export const TestDetailsSummary: FC<TestDetailsSummaryProps> = ({ duration, endTime, thread }) => {
  return (
    <Section>
      <TestSummaryItem
        iconName={Icon.Name.Clock}
        title="Duration"
        value={formatMs(duration)}
        testId={testIds.durationField}
      />
      <TestSummaryItem
        iconName={Icon.Name.Calendar}
        title="Finished at"
        value={new Date(endTime).toLocaleString()}
        testId={testIds.endTimeField}
      />
      {thread && (
        <TestSummaryItem
          iconName={Icon.Name.Settings}
          title="Thread"
          value={thread}
          testId={testIds.threadField}
        />
      )}
    </Section>
  );
};
