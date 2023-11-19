import styled from 'styled-components';
import { withTestId } from 'utils/use-test-id-attribute';

export const ItemWrapper = styled.div`
  padding-right: 16px;
`;

export const Item = withTestId<
  React.HTMLAttributes<HTMLDivElement> & { testId?: string; $active?: boolean }
>(styled.div<{ $active?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  cursor: pointer;
  padding: 6px 0;
  width: 100%;
  border-bottom: 1px solid rgba(50, 66, 95, 0.17);
  box-sizing: border-box;
  height: 32px;
  overflow-y: hidden;
  transition: background 0.3s ease;
  &:hover {
    background: #f5f6f7;
  }
  ${props => (props.$active ? 'background: #f5f6f7;' : '')}
`);

export const ItemTitle = styled.div`
  max-width: 400px;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const ItemIconSlot = styled.div`
  margin-right: 4px;
`;

export const ItemTimeSlot = styled.div`
  margin-right: 12px;
`;
