import { FC } from 'react';
import { Text } from 'components/text';
import { Heading } from 'components/heading';
import { IconName } from 'components/icon/icon-types';
import { Icon } from 'components/icon';
import styled from 'styled-components';

const SectionItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const SectionValue = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2px;
  align-items: center;
`;

const SectionTitleSlot = styled.div`
  margin-bottom: 6px;
`;

export const TestSummaryItem: FC<{
  title: string;
  value: string;
  iconName: IconName;
  testId: string;
}> = ({ title, value, iconName, testId }) => {
  return (
    <SectionItem>
      <SectionTitleSlot>
        <Text size={Text.Size.M1} weight={Text.Weight.Semibold}>
          {title}
        </Text>
      </SectionTitleSlot>
      <SectionValue>
        <Icon iconName={iconName} size={Icon.Size.S} />
        <Text size={Text.Size.S1} weight={Text.Weight.Normal} testId={testId}>
          {value}
        </Text>
      </SectionValue>
    </SectionItem>
  );
};
