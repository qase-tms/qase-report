import { Color } from 'constants/colors';
import styled from 'styled-components';

const HEADER_HEIGHT = 50;
const TAB_MARGIN = 20;
const TABS_HEIGHT = 26;

export const Layout = styled.div`
  height: calc(100vh - ${HEADER_HEIGHT}px);
`;

export const TabWrapper = styled.div`
  margin-top: 20px;
  padding: 0 18px 0;
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

export const Tab = styled.div<{ $active: boolean }>`
  cursor: pointer;
  box-sizing: border-box;
  padding-bottom: 5px;
  ${props => (props.$active ? `color: ${props.theme.colors[Color.Blue]};` : '')}
  ${props => (props.$active ? `border-bottom: 3px solid ${props.theme.colors[Color.Blue]};` : '')}
    ${props => (props.$active ? `margin-bottom: -3px;` : '')}
`;

export const Panel = styled.div`
  box-sizing: border-box;
  overflow-y: hidden;
  height: calc(100vh - ${HEADER_HEIGHT + TAB_MARGIN + TABS_HEIGHT}px);
  padding-left: 16px;
`;
