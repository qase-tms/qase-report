import { FC } from 'react';
import { Icon } from 'components/icon';
import { Divider } from 'components/divider';
import { Text } from 'components/text';
import styled from 'styled-components';

const StyledHeader = styled.div`
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  align-items: flex-end;
  gap: 6px;
  width: 100%;
  background-color: white;
  padding: 16px 18px;
  box-shadow: 0px 0px 1px 0px rgba(9, 30, 66, 0.31), 0px 0px 4px 0px rgba(9, 30, 66, 0.25);
`;

export const Header: FC = () => {
  return (
    <StyledHeader>
      <Icon iconName={Icon.Name.Logo} />
      <Divider />
      <Text size={Text.Size.M1}>Report</Text>
    </StyledHeader>
  );
};
