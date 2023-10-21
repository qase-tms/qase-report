import {FC} from 'react';
import { Spacer, SpacerJustify, SpacerPreset } from 'components/spacer/spacer';
import { Text, TextColor, TextSizes, TextWeight } from 'components/text/text';
import { TestPreview, TestStatus } from 'domain/model/test-model';
import { Icon, IconNames, IconSizes } from 'components/icon/icon';
import { formatSeconds } from 'utils/time';
import offsetStyles from 'common-styles/offsets.module.css';

type TestPreviewItemProps = {
    test: TestPreview
}

export const TestPreviewItem: FC<TestPreviewItemProps> = ({ test: {title, status, duration}}) => {
    return (
    <Spacer className={offsetStyles['padding-16-16']} preset={SpacerPreset.BorderedBottom} justifyContent={SpacerJustify.SpaceBetween} fullWidth>
        <Text weight={TextWeight.Bold}>{title}</Text>
        <Spacer>
            <Icon  className={offsetStyles['margin-right-2']} iconName={IconNames.Clock} />
            <Text className={offsetStyles['margin-right-16']} size={TextSizes.S1} weight={TextWeight.Normal} color={TextColor.Secondary}>{formatSeconds(duration)}</Text>
            <Icon iconName={status === TestStatus.Passed ? IconNames.CheckMark : IconNames.Fail} size={IconSizes.M} />
        </Spacer>
    </Spacer>
    );
}