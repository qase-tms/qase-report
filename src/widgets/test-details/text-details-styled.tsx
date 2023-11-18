import styled from 'styled-components';
import { PANE_CALC_HEIGHT } from 'components/page-layout/page-layout-styled';

export const Container = styled.div`
  padding: 0 16px;
`;

export const PanelHeader = styled.div`
  margin: 16px 0 8px;
`;

export const CardSubHeader = styled.div`
  word-wrap: break-word;
  overflow: hidden;
  margin-bottom: 8px;
  width: 100%;
`;

export const PanelContent = styled.div`
    display: flex;
    flex-direction: row:
    align-items: flex-start;
`;

const PANEL_PADDING = 60;

export const DetailsPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-right: 1px solid rgba(50, 66, 95, 0.17);
  width: 500px;
  padding-right: 16px;
  height: calc(${PANE_CALC_HEIGHT} - ${PANEL_PADDING}px);
  overflow-y: scroll;
`;
