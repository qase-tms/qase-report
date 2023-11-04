import styled from 'styled-components';

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 16px;
  border-left: 1px solid #e0e1e4;
`;

export const SectionTitleSlot = styled.div`
  margin-bottom: 4px;
`;

export const SectionValue = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2px;
  margin-bottom: 18px;
  align-items: center;
`;
