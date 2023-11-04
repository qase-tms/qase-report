import { FC } from 'react';
import { Spacer } from 'components/spacer';
import { Text } from 'components/text';
import { Icon } from 'components/icon';
import { formatMs } from 'utils/time';
import { createTestId } from 'utils/use-test-id-attribute';

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

export const TestDetailsSummary: FC<TestDetailsSummaryProps> = ({ duration, endTime, thread }) => {
  return (
    <Spacer
      fullHeight
      direction={Spacer.Direction.Column}
      align={Spacer.Align.Start}
      css={`
        padding: 0 16px;
      `}
      preset={Spacer.Preset.BorderedLeft}
    >
      <Text
        size={Text.Size.M1}
        weight={Text.Weight.Semibold}
        css={'margin-bottom: 4px;'}
        tagName="p"
      >
        Duration
      </Text>
      <Spacer
        gap={2}
        css={`
          margin-bottom: 18px;
        `}
        align={Spacer.Align.End}
      >
        <Icon iconName={Icon.Name.Clock} size={Icon.Size.S} />
        <Text size={Text.Size.S1} weight={Text.Weight.Normal} testId={testIds.durationField}>
          {formatMs(duration)}
        </Text>
      </Spacer>
      <Text
        size={Text.Size.M1}
        weight={Text.Weight.Semibold}
        css={'margin-bottom: 4px;'}
        tagName="p"
      >
        Finished at
      </Text>
      <Spacer
        gap={2}
        css={`
          margin-bottom: 18px;
        `}
        align={Spacer.Align.End}
      >
        <Icon iconName={Icon.Name.Calendar} size={Icon.Size.S} />
        <Text size={Text.Size.S1} weight={Text.Weight.Normal} testId={testIds.endTimeField}>
          {new Date(endTime).toLocaleString()}
        </Text>
      </Spacer>
      <Text
        size={Text.Size.M1}
        weight={Text.Weight.Semibold}
        css={'margin-bottom: 4px;'}
        tagName="p"
      >
        Thread
      </Text>
      <Spacer
        gap={2}
        css={`
          margin-bottom: 18px;
        `}
        align={Spacer.Align.End}
      >
        <Icon iconName={Icon.Name.Settings} size={Icon.Size.S} />
        <Text size={Text.Size.S1} weight={Text.Weight.Normal} testId={testIds.threadField}>
          {thread}
        </Text>
      </Spacer>
    </Spacer>
  );
};
