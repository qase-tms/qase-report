import styled from 'styled-components';
import { withTestId } from 'utils/use-test-id-attribute';

export const Item = withTestId<
  React.HTMLAttributes<HTMLDivElement> & { testId?: string }
>(styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  cursor: pointer;
  padding: 16px 16px;
  width: 100%;
  border-bottom: 1px solid rgba(50, 66, 95, 0.17);
  box-sizing: border-box;
  height: 55px;
  overflow-y: hidden;
`);

export const ItemTitle = styled.div`
  max-width: 400px;
  word-wrap: break-word;
`;

export const ItemIconSlot = styled.div`
  margin-right: 4px;
`;

export const ItemTimeSlot = styled.div`
  margin-right: 12px;
`;
