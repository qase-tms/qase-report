import styled from 'styled-components';

export const Container = styled.div`
  padding-bottom: 30px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-sizing: border-box;
`;

export const PanelHeader = styled.div`
  margin: 16px 0 8px;
`;

export const CardSubHeader = styled.div`
  word-wrap: break-word;
  overflow: hidden;
  margin-bottom: 8px;
  width: 500px;
`;

export const TabsSlot = styled.div`
  width: 500px;
  margin-bottom: 16px;
`;

export const PanelContent = styled.div`
    display: flex;
    flex-direction: row:
    align-items: flex-start;
`;

export const DetailsPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-right: 1px solid rgba(50, 66, 95, 0.17);
  width: 500px;
  padding-right: 16px;
  height: 100%;
  overflow-y: scroll;
`;
