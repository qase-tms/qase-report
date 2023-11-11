import { FC } from 'react';
import { Text } from 'components/text';
import { Icon } from 'components/icon';
import { formatMs } from 'utils/time';
import { createTestId } from 'utils/use-test-id-attribute';
import {
  Section,
  SectionTitleSlot,
  SectionValue,
  SectionItem,
} from './test-details-summary-styled';
import { IconName } from 'src/components/icon/icon-types';

type TestDetailsSummaryProps = {
  duration: number;
  endTime: number;
  thread: string;
};

const TestIdNamespace = 'TEST_DETAILS_SUMMARY';

export const testIds = {
  durationField: createTestId(TestIdNamespace, 'duration-field'),
  endTimeField: createTestId(TestIdNamespace, 'endTime-Field'),
  threadField: createTestId(TestIdNamespace, 'thread-field'),
};

const FieldInfo: FC<{ title: string; value: string; iconName: IconName; testId: string }> = ({
  title,
  value,
  iconName,
  testId,
}) => {
  return (
    <SectionItem>
      <SectionTitleSlot>
        <Text size={Text.Size.M1} weight={Text.Weight.Semibold} tagName="p">
          {title}
        </Text>
      </SectionTitleSlot>
      <SectionValue>
        <Icon iconName={iconName} size={Icon.Size.S} />
        <Text size={Text.Size.S1} weight={Text.Weight.Normal} testId={testId}>
          {value}
        </Text>
      </SectionValue>
    </SectionItem>
  );
};

export const TestDetailsSummary: FC<TestDetailsSummaryProps> = ({ duration, endTime, thread }) => {
  return (
    <Section>
      <FieldInfo
        iconName={Icon.Name.Clock}
        title="Duration"
        value={formatMs(duration)}
        testId={testIds.durationField}
      />
      <FieldInfo
        iconName={Icon.Name.Calendar}
        title="Finished at"
        value={new Date(endTime).toLocaleString()}
        testId={testIds.endTimeField}
      />
      <FieldInfo
        iconName={Icon.Name.Settings}
        title="Thread"
        value={thread}
        testId={testIds.threadField}
      />
    </Section>
  );
};
