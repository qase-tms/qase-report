import styled from 'styled-components';

const HEADER_HEIGHT = 50;
const TAB_MARGIN = 20;
const TABS_HEIGHT = 26;

export const PANE_CALC_HEIGHT = `100vh - ${HEADER_HEIGHT + TAB_MARGIN + TABS_HEIGHT}px`;

export const Layout = styled.div`
  box-sizing: border-box;
  height: calc(100vh - ${HEADER_HEIGHT}px - ${TAB_MARGIN}px);
`;

export const TabsWrapper = styled.div`
  padding: 20px 18px 0;
`;

export const Panel = styled.div`
  box-sizing: border-box;
  overflow-y: hidden;
  height: calc(${PANE_CALC_HEIGHT});
  padding-left: 16px;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
`;

export const PaneWrapper = styled.div`
  box-sizing: border-box;
  overflow-y: hidden;
  height: calc(${PANE_CALC_HEIGHT});
`;
