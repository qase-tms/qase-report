import { FC } from 'react';
import { Spacer } from 'components/spacer';
import { Icon } from 'components/icon';
import { Text } from 'components/text';
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
        <Spacer direction={Spacer.Direction.Row} gap={6} css={detailsCss + (css ?? '')}>
            {
                isPassed ? <Icon iconName={Icon.Name.CheckMark} size={Icon.Size.S} testId={testIds.headerPassedIcon}/> : <Icon iconName={Icon.Name.Fail} size={Icon.Size.S} testId={testIds.headerFailedIcon} />
            }
            <Text color={isPassed ? Text.Color.Success : Text.Color.Error} size={Text.Size.M2} tagName='h1' testId={testIds.headerTitle}>{isPassed ? 'Passed' : 'Failed'}</Text>
        </Spacer>
    );
}