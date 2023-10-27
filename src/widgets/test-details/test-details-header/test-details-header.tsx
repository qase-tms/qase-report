import { FC } from 'react';
import { Spacer, SpacerDirections } from 'components/spacer/spacer';
import { Icon, IconNames, IconSizes } from 'components/icon/icon';
import { Text, TextColor, TextSizes } from 'components/text/text';
import { TestStatus } from 'domain/model/test-model';
import { createTestId } from 'utils/use-test-id-attribute';

type TestDetailsHeaderProps = {
    status: TestStatus,
    css?: string
};

const TestIdNamespace = 'TEST_DETAILS_HEADER';

export const testIds = {
    headerPassedIcon: createTestId(TestIdNamespace, 'header-passed-icon'),
    headerFailedIcon: createTestId(TestIdNamespace, 'header-failed-icon'),
    headerTitle: createTestId(TestIdNamespace, 'header-title'),
};

const detailsCss = `
    padding: 0 16px;
    max-width: 500px;
`;

export const TestDetailsHeader:FC<TestDetailsHeaderProps> = ({status, css}) => {
    const isPassed = status === TestStatus.Passed;
    return (
        <Spacer direction={SpacerDirections.Row} gap={6} css={detailsCss + (css ?? '')}>
            {
                isPassed ? <Icon iconName={IconNames.CheckMark} size={IconSizes.S} testId={testIds.headerPassedIcon}/> : <Icon iconName={IconNames.Fail} size={IconSizes.S} testId={testIds.headerFailedIcon}/>
            }
            
            <Text color={isPassed ? TextColor.Success : TextColor.Error} size={TextSizes.M2} tagName='h1' testId={testIds.headerTitle}>{isPassed ? 'Passed' : 'Failed'}</Text>
        </Spacer>
    );
}