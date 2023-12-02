import styled from 'styled-components';
import { Color } from 'constants/colors';

export const TabWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

export const TabRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  box-sizing: border-box;
  width: 100%;
  gap: 20px;
  border-bottom: 3px solid rgba(19, 38, 71, 0.1);
`;

export const TabStyled = styled.div<{ $active: boolean }>`
  cursor: pointer;
  box-sizing: border-box;
  padding-bottom: 5px;
  margin-bottom: -3px;
  border-bottom: 3px solid transparent;
  transition: border 0.3s ease, color 0.3s ease;
  ${props => (props.$active ? `color: ${props.theme.colors[Color.Blue]};` : '')}
  ${props => (props.$active ? `border-bottom: 3px solid ${props.theme.colors[Color.Blue]};` : '')}
`;
