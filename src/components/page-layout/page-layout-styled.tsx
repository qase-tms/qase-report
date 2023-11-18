import { Color } from 'constants/colors';
import styled from 'styled-components';

const HEADER_HEIGHT = 50;
const TAB_MARGIN = 20;
const TABS_HEIGHT = 26;

export const PANE_CALC_HEIGHT = `100vh - ${HEADER_HEIGHT + TAB_MARGIN + TABS_HEIGHT}px`;

export const Layout = styled.div`
  height: calc(100vh - ${HEADER_HEIGHT}px - ${TAB_MARGIN}px);
`;

export const Panel = styled.div`
  box-sizing: border-box;
  overflow-y: hidden;
  height: calc(${PANE_CALC_HEIGHT});
  padding-left: 16px;
  padding-top: 16px;
`;

export const PaneWrapper = styled.div`
  box-sizing: border-box;
  overflow-y: hidden;
  height: calc(${PANE_CALC_HEIGHT});
`;
