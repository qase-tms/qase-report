import styled from 'styled-components';

export const Section = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(50, 66, 95, 0.05);
  justify-content: space-between;
  width: 100%;
  border-radius: 6px;
`;

export const SectionItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const SectionTitleSlot = styled.div`
  margin-bottom: 6px;
`;

export const SectionValue = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2px;
  align-items: center;
`;
