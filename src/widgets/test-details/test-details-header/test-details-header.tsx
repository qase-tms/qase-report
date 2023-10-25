import { FC } from 'react';
import { Spacer, SpacerAlign, SpacerDirections, SpacerGaps } from 'components/spacer/spacer';
import { Icon, IconNames, IconSizes } from 'components/icon/icon';
import { Text, TextColor, TextSizes } from 'components/text/text';
import commonStyles from 'common-styles/offsets.module.css';
import { TestStatus } from 'domain/model/test-model';
import { createTestId } from 'utils/use-test-id-attribute';
import cn from 'classnames';

type TestDetailsHeaderProps = {
    status: TestStatus,
    className?: string
};

const TestIdNamespace = 'TEST_DETAILS_HEADER';

export const testIds = {
    headerPassedIcon: createTestId(TestIdNamespace, 'header-passed-icon'),
    headerFailedIcon: createTestId(TestIdNamespace, 'header-failed-icon'),
    headerTitle: createTestId(TestIdNamespace, 'header-title'),
};

export const TestDetailsHeader:FC<TestDetailsHeaderProps> = ({status, className}) => {
    const isPassed = status === TestStatus.Passed;
    return (
        <Spacer direction={SpacerDirections.Row} gap={SpacerGaps.S} className={cn(commonStyles['padding-0-16'], commonStyles['max-width-500'], className)}>
            {
                isPassed ? <Icon iconName={IconNames.CheckMark} size={IconSizes.S} testId={testIds.headerPassedIcon}/> : <Icon iconName={IconNames.Fail} size={IconSizes.S} testId={testIds.headerFailedIcon}/>
            }
            
            <Text color={isPassed ? TextColor.Success : TextColor.Error} size={TextSizes.M2} tagName='h1' testId={testIds.headerTitle}>{isPassed ? 'Passed' : 'Failed'}</Text>
        </Spacer>
    );
}