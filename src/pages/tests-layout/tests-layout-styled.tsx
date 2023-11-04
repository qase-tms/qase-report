import styled from 'styled-components';

export const Layout = styled.div`
  height: calc(100vh - 50px);
`;

export const Panel = styled.div`
  overflow-y: scroll;
  max-height: calc(100vh - 50px);
`;

export const PanelContent = styled.div`
  padding: 16px 16px;
  max-width: 900px;
  display: flex;
  flex-direction: column;
`;
