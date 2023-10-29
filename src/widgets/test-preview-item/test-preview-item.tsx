import { FC, useCallback } from 'react';
import { Spacer } from 'components/spacer';
import { Text } from 'components/text';
import { TestPreview } from 'domain/model/test-model';
import { Icon } from 'components/icon';
import { formatMs } from 'utils/time';
import { TestStatusField } from 'widgets/test-status-field';
import { createTestId } from 'utils/use-test-id-attribute';

type TestPreviewItemProps = {
    test: TestPreview,
    onSelect?: (test: TestPreview) => void
}

const testIdNamespace = 'WIDGET_TEST_PREVIEW_ITEM';

export const testIds = {
    itemRoot: createTestId(testIdNamespace, 'item-root'),
    itemTitle: createTestId(testIdNamespace, 'item-title'),
    itemFieldDuration: createTestId(testIdNamespace, 'item-field-duration'),
};

const titleCss = `
    max-width:400px;
    word-wrap: break-word;
`;

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
            preset={Spacer.Preset.BorderedBottom}
            justifyContent={Spacer.Justify.SpaceBetween}
            fullWidth
            onClick={handleClick}
            testId={testIds.itemRoot}>
            <Text weight={Text.Weight.Bold} testId={testIds.itemTitle} css={titleCss}>{title}</Text>
            <Spacer>
                <Icon css='margin-right: 2px' iconName={Icon.Name.Clock} />
                <Text css={`margin-right: 16px;`}
                    size={Text.Size.S1}
                    weight={Text.Weight.Normal}
                    testId={testIds.itemFieldDuration}>
                    {formatMs(duration)}
                </Text>
                <TestStatusField status={status} size={Icon.Size.M}/>
            </Spacer>
        </Spacer>
    );
}