import { FC } from 'react';
import { useTestIdAttribute } from 'utils/use-test-id-attribute';
import styled from 'styled-components';

type DividerProps = {
  testId?: string;
  height?: string;
};

const Bar = styled.div<{ $css?: string; $height?: string }>`
  height: ${props => props.$height ?? '14px'};
  width: 1px;
  box-sizing: border-box;
  background: #32425f40;
`;

export const Divider: FC<DividerProps> = ({ testId, height }) => {
  const testIdAttribute = useTestIdAttribute(testId);
  return <Bar $height={height} {...testIdAttribute} />;
};
