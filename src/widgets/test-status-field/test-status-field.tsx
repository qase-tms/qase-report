import {FC} from 'react';
import { TestStatus } from 'domain/model/test-model';
import { Spacer } from 'components/spacer';
import { Icon } from 'components/icon';
import { Text } from 'components/text';
import { IconName, IconSize } from 'components/icon/icon-types';
import { Color } from 'constants/colors';
import { createTestId } from 'utils/use-test-id-attribute';

type TestStatusFieldProps = {
    status: TestStatus,
    css?: string,
    size?: IconSize,
    withText?: boolean
};

const statusToColor:Record<TestStatus,Color> = {
    [TestStatus.Failed]: Color.Red,
    [TestStatus.Passed]: Color.Green,
    [TestStatus.Skipped]: Color.Cyan,
    [TestStatus.Invalid]: Color.Violet
};

const statusToIconName:Record<TestStatus,IconName> = {
    [TestStatus.Failed]: IconName.Fail,
    [TestStatus.Passed]: IconName.CheckMark,
    [TestStatus.Skipped]: IconName.Minus,
    [TestStatus.Invalid]: IconName.Exclamation
};

const TestIdNamespace = 'WIDGET_TEST_STATUS_FIELD';

export const testIds = {
    statusText: createTestId(TestIdNamespace, 'status-text'),
};

export const TestStatusField:FC<TestStatusFieldProps> = ({status, css, withText, size=Icon.Size.S }) => {
    const iconName = statusToIconName[status];
    const color = statusToColor[status];
    if(!withText) {
        return (<Icon iconName={iconName} size={size} css={css}/>)
    }
    return (
        <Spacer direction={Spacer.Direction.Row} gap={6} css={css}>
            <Icon iconName={iconName} size={size} />
            <Text color={color} size={Text.Size.M2} css='text-transform: capitalize;' testId={testIds.statusText}>{status}</Text>
        </Spacer>
    );
};