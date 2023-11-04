import { FC } from 'react';
import { TestStatus } from 'domain/model/test-model';
import { Icon } from 'components/icon';
import { Text } from 'components/text';
import { IconName, IconSize } from 'components/icon/icon-types';
import { Color } from 'constants/colors';
import { createTestId } from 'utils/use-test-id-attribute';
import { FlexRow } from 'components/flex-row';
import styled from 'styled-components';

type TestStatusFieldProps = {
  status: TestStatus;
  css?: string;
  size?: IconSize;
  withText?: boolean;
};

const statusToColor: Record<TestStatus, Color> = {
  [TestStatus.Failed]: Color.Red,
  [TestStatus.Passed]: Color.Green,
  [TestStatus.Skipped]: Color.Cyan,
  [TestStatus.Invalid]: Color.Violet,
};

const statusToIconName: Record<TestStatus, IconName> = {
  [TestStatus.Failed]: IconName.Fail,
  [TestStatus.Passed]: IconName.CheckMark,
  [TestStatus.Skipped]: IconName.Minus,
  [TestStatus.Invalid]: IconName.Exclamation,
};

const TestIdNamespace = 'WIDGET_TEST_STATUS_FIELD';

export const testIds = {
  statusText: createTestId(TestIdNamespace, 'status-text'),
};

const TextSlot = styled.div`
  margin-left: 6px;
  text-transform: capitalize;
`;

export const TestStatusField: FC<TestStatusFieldProps> = ({
  status,
  css,
  withText,
  size = Icon.Size.S,
}) => {
  const iconName = statusToIconName[status];
  const color = statusToColor[status];
  if (!withText) {
    return <Icon iconName={iconName} size={size} />;
  }
  return (
    <FlexRow>
      <Icon iconName={iconName} size={size} />
      <TextSlot>
        <Text color={color} size={Text.Size.M2} testId={testIds.statusText}>
          {status}
        </Text>
      </TextSlot>
    </FlexRow>
  );
};
