import { FC } from 'react';
import { Spacer, SpacerDirections, SpacerGaps } from 'components/spacer/spacer';
import { Icon, IconNames } from 'components/icon/icon';
import { Text, TextColor, TextSizes } from 'components/text/text';
import commonStyles from 'common-styles/offsets.module.css';
import { TestStatus } from 'domain/model/test-model';
import cn from 'classnames';

type TestDetailsHeaderProps = {
    status: TestStatus,
    className?: string
};

export const TestDetailsHeader:FC<TestDetailsHeaderProps> = ({status, className}) => {
    const isPassed = status === TestStatus.Passed;
    return (
        <Spacer direction={SpacerDirections.Row} gap={SpacerGaps.S} className={cn(commonStyles['padding-0-16'], commonStyles['max-width-500'], className)}>
            <Icon iconName={isPassed ? IconNames.CheckMark : IconNames.Fail} />
            <Text color={isPassed ? TextColor.Primary : TextColor.Error} size={TextSizes.M2} tagName='h1'>{isPassed ? 'Passed' : 'Failed'}</Text>
        </Spacer>
    );
}