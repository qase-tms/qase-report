import styled from 'styled-components';
import { withTestId } from 'utils/use-test-id-attribute';

export const Item = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  margin-bottom: 12px;
`;

export const ItemContent = withTestId<
  React.HTMLAttributes<HTMLDivElement> & { testId?: string }
>(styled.div`
  margin-left: 36px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`);

export const SubHeader = styled.div`
  margin-bottom: 6px;
`;

export const Info = styled.div`
  margin-bottom: 12px;
`;

export const Bar = styled.div<{ $x: number }>`
  height: 24px;
  width: 1px;
  box-sizing: border-box;
  background: rgba(50, 66, 95, 0.17);
  transform: translateX(${props => props.$x}px);
  position: absolute;
`;
