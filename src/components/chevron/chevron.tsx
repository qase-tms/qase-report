import { FC } from 'react';
import { Icon } from 'components/icon';
import { Color } from 'constants/colors';
import styled from 'styled-components';

type Props = {
  opened?: boolean;
};

const Box = styled.div`
  box-sizing: border-box;
  background-color: ${props => props.theme.colors[Color.Background]};
  height: 24px;
  width: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  cursor: pointer;
`;

export const Chevron: FC<Props> = ({ opened }) => {
  return (
    <Box>
      <Icon size={Icon.Size.S} iconName={opened ? Icon.Name.AngleDown : Icon.Name.AngleRight} />
    </Box>
  );
};
