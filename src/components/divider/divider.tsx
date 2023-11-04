import { FC } from 'react';
import { useTestIdAttribute } from 'utils/use-test-id-attribute';
import styled from 'styled-components';

type DividerProps = {
  css?: string;
  testId?: string;
  height?: string;
};

const Div = styled.div<{ $css?: string; $height?: string }>`
  height: ${props => props.$height ?? '14px'};
  width: 1px;
  box-sizing: border-box;
  background: #32425f40;
  ${props => props.$css ?? ''}
`;

export const Divider: FC<DividerProps> = ({ css, testId, height }) => {
  const testIdAttribute = useTestIdAttribute(testId);
  return <Div $css={css} $height={height} {...testIdAttribute} />;
};
