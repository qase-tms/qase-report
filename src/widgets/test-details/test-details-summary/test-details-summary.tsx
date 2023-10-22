import { FC } from 'react';
import { Spacer, SpacerDirections, SpacerAlign, SpacerPreset, SpacerGaps } from 'components/spacer/spacer';
import {Text, TextSizes, TextWeight, TextColor} from 'components/text/text';
import {Icon, IconNames, IconSizes} from 'components/icon/icon';
import commonStyles from 'common-styles/offsets.module.css';
import { formatSeconds } from 'utils/time';

type TestDetailsSummaryProps = {
    duration: number,
    endTime: number,
    thread: string
}

export const TestDetailsSummary: FC<TestDetailsSummaryProps> = ({duration, endTime, thread}) => {
    return (
        <Spacer fullHeight direction={SpacerDirections.Column} align={SpacerAlign.Start} className={commonStyles['padding-0-16']} preset={SpacerPreset.BorderedLeft}>
            <Text color={TextColor.Secondary} size={TextSizes.M1} weight={TextWeight.Semibold} className={commonStyles['margin-bottom-4']} tagName='p'>Duration</Text>
            <Spacer gap={SpacerGaps.XS} className={commonStyles['margin-bottom-18']} align={SpacerAlign.End}>
                <Icon iconName={IconNames.Clock} size={IconSizes.S} />
                <Text size={TextSizes.S1} weight={TextWeight.Normal}>{formatSeconds(duration)}</Text>
            </Spacer>
            <Text color={TextColor.Secondary} size={TextSizes.M1} weight={TextWeight.Semibold} className={commonStyles['margin-bottom-4']} tagName='p'>Finished at</Text>
            <Spacer gap={SpacerGaps.XS} className={commonStyles['margin-bottom-18']} align={SpacerAlign.End}>
                <Icon iconName={IconNames.Calendar} size={IconSizes.S} />
                <Text size={TextSizes.S1} weight={TextWeight.Normal}>{new Date(endTime).toLocaleString()}</Text>
            </Spacer>
            <Text color={TextColor.Secondary} size={TextSizes.M1} weight={TextWeight.Semibold} className={commonStyles['margin-bottom-4']} tagName='p'>Thread</Text>
            <Spacer gap={SpacerGaps.XS} className={commonStyles['margin-bottom-18']} align={SpacerAlign.End}>
                <Icon iconName={IconNames.Settings} size={IconSizes.S} />
                <Text size={TextSizes.S1} weight={TextWeight.Normal}>{thread}</Text>
            </Spacer>
        </Spacer>
    );
}