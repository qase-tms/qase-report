import { FC, useCallback } from 'react';
import { Text } from 'components/text';
import { TestPreview } from 'domain/model/test-model';
import { Icon } from 'components/icon';
import { formatMs } from 'utils/time';
import { TestStatusField } from 'widgets/test-status-field';
import { createTestId } from 'utils/use-test-id-attribute';
import { FlexRow } from 'components/flex-row';
import {
  Item,
  ItemIconSlot,
  ItemTitle,
  ItemTimeSlot,
  ItemWrapper,
} from './test-preview-item-styled';

type TestPreviewItemProps = {
  test: TestPreview;
  onSelect?: (test: TestPreview) => void;
  isActive?: boolean;
};

const testIdNamespace = 'WIDGET_TEST_PREVIEW_ITEM';

export const testIds = {
  itemRoot: createTestId(testIdNamespace, 'item-root'),
  itemTitle: createTestId(testIdNamespace, 'item-title'),
  itemFieldDuration: createTestId(testIdNamespace, 'item-field-duration'),
};

export const TestPreviewItem: FC<TestPreviewItemProps> = ({ test, onSelect, isActive }) => {
  const { title, status, duration } = test;

  const handleClick = useCallback(() => {
    if (onSelect) {
      onSelect(test);
    }
  }, [test, onSelect]);

  return (
    <ItemWrapper>
      <Item onClick={handleClick} testId={testIds.itemRoot} $active={isActive}>
        <ItemTitle>
          <Text weight={Text.Weight.Bold} testId={testIds.itemTitle} size={Text.Size.M1}>
            {title}
          </Text>
        </ItemTitle>
        <FlexRow>
          <ItemIconSlot>
            <Icon iconName={Icon.Name.Clock} size={Icon.Size.XS} />
          </ItemIconSlot>
          <ItemTimeSlot>
            <Text
              size={Text.Size.S1}
              weight={Text.Weight.Normal}
              testId={testIds.itemFieldDuration}
            >
              {formatMs(duration)}
            </Text>
          </ItemTimeSlot>
          <TestStatusField status={status} size={Icon.Size.M} />
        </FlexRow>
      </Item>
    </ItemWrapper>
  );
};
