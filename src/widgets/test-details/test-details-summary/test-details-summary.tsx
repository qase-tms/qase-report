import { FC } from 'react';
import { Spacer, SpacerDirections, SpacerAlign, SpacerPreset } from 'components/spacer/spacer';
import {Text, TextSizes, TextWeight, TextColor} from 'components/text/text';
import {Icon, IconNames, IconSizes} from 'components/icon/icon';
import { formatMs } from 'utils/time';
import { createTestId } from 'utils/use-test-id-attribute';

type TestDetailsSummaryProps = {
    duration: number,
    endTime: number,
    thread: string
};

const TestIdNamespace = 'TEST_DETAILS_SUMMARY';

export const testIds = {
    durationField: createTestId(TestIdNamespace, 'duration-field'),
    endTimeField: createTestId(TestIdNamespace, 'endTime-Field'),
    threadField: createTestId(TestIdNamespace, 'thread-field')
};

export const TestDetailsSummary: FC<TestDetailsSummaryProps> = ({duration, endTime, thread}) => {
    return (
        <Spacer fullHeight direction={SpacerDirections.Column} align={SpacerAlign.Start} css={`padding: 0 16px;`} preset={SpacerPreset.BorderedLeft}>
            <Text color={TextColor.Secondary} size={TextSizes.M1} weight={TextWeight.Semibold} css={'margin-bottom: 4px;'} tagName='p'>Duration</Text>
            <Spacer gap={2}  css={`margin-bottom: 18px;`} align={SpacerAlign.End}>
                <Icon iconName={IconNames.Clock} size={IconSizes.S} />
                <Text size={TextSizes.S1} weight={TextWeight.Normal} testId={testIds.durationField}>{formatMs(duration)}</Text>
            </Spacer>
            <Text color={TextColor.Secondary} size={TextSizes.M1} weight={TextWeight.Semibold} css={'margin-bottom: 4px;'} tagName='p'>Finished at</Text>
            <Spacer gap={2} css={`margin-bottom: 18px;`} align={SpacerAlign.End}>
                <Icon iconName={IconNames.Calendar} size={IconSizes.S} />
                <Text size={TextSizes.S1} weight={TextWeight.Normal}  testId={testIds.endTimeField}>{new Date(endTime).toLocaleString()}</Text>
            </Spacer>
            <Text color={TextColor.Secondary} size={TextSizes.M1} weight={TextWeight.Semibold} css={'margin-bottom: 4px;'} tagName='p'>Thread</Text>
            <Spacer gap={2} css={`margin-bottom: 18px;`} align={SpacerAlign.End}>
                <Icon iconName={IconNames.Settings} size={IconSizes.S} />
                <Text size={TextSizes.S1} weight={TextWeight.Normal} testId={testIds.threadField}>{thread}</Text>
            </Spacer>
        </Spacer>
    );
}