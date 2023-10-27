import { FC, useCallback } from 'react';
import { Spacer, SpacerJustify, SpacerPreset } from 'components/spacer/spacer';
import { Text, TextColor, TextSizes, TextWeight } from 'components/text/text';
import { TestPreview, TestStatus } from 'domain/model/test-model';
import { Icon, IconNames, IconSizes } from 'components/icon/icon';
import { formatMs } from 'utils/time';
import { createTestId } from 'utils/use-test-id-attribute';

type TestPreviewItemProps = {
    test: TestPreview,
    onSelect?: (test: TestPreview) => void
}

const testIdNamespace = 'WIDGET_TEST_PREVIEW_ITEM';

export const testIds = {
    itemRoot: createTestId(testIdNamespace, 'item-root'),
    itemTitle: createTestId(testIdNamespace, 'item-title'),
    itemIconSuccess: createTestId(testIdNamespace, 'item-icon-success'),
    itemIconFail: createTestId(testIdNamespace, 'item-icon-fail'),
    itemFieldDuration: createTestId(testIdNamespace, 'item-field-duration'),
}

export const TestPreviewItem: FC<TestPreviewItemProps> = ({ test, onSelect }) => {

    const { title, status, duration } = test;

    const handleClick = useCallback(() => {
        if (onSelect) {
            onSelect(test);
        }
    }, [test, onSelect]);

    return (
        <Spacer
            css={'padding: 16px 16px; cursor: pointer;'}
            preset={SpacerPreset.BorderedBottom}
            justifyContent={SpacerJustify.SpaceBetween}
            fullWidth
            onClick={handleClick}
            testId={testIds.itemRoot}>
            <Text weight={TextWeight.Bold} testId={testIds.itemTitle}>{title}</Text>
            <Spacer>
                <Icon css='margin-right: 2px' iconName={IconNames.Clock} />
                <Text css={`margin-right: 16px;`}
                    size={TextSizes.S1}
                    weight={TextWeight.Normal}
                    color={TextColor.Secondary}
                    testId={testIds.itemFieldDuration}>
                    {formatMs(duration)}
                </Text>
                {status === TestStatus.Passed ?
                    <Icon iconName={IconNames.CheckMark} size={IconSizes.M} testId={testIds.itemIconSuccess} /> :
                    <Icon iconName={IconNames.Fail} size={IconSizes.M} testId={testIds.itemIconFail} />}
            </Spacer>
        </Spacer>
    );
}