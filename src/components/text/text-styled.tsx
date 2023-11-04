import { FC, PropsWithChildren } from 'react';
import { TextSize, TextWeight, TextColor } from './text-types';
import styled from 'styled-components';

type TextTagProps = PropsWithChildren<{
  $size?: TextSize;
  $weight?: TextWeight;
  tagName?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  $color?: TextColor;
}>;

const TextTag: FC<TextTagProps> = ({ tagName = 'span', ...rest }) => {
  const Tag = tagName;
  const { $size, $weight, $color, ...other } = rest;
  return <Tag {...other} />;
};

const sizeCss: Record<TextSize, string> = {
  [TextSize.S1]: `
        font-size: 12px;
        line-height: 12px;
    `,
  [TextSize.M1]: `
        font-size: 14px;
        line-height: 14px;
    `,
  [TextSize.M2]: `
        font-size: 16px;
        line-height: 16px;
    `,
  [TextSize.L1]: `
        font-size: 24px;
        line-height: 26px;
    `,
};

const weightCss: Record<TextWeight, number> = {
  [TextWeight.Normal]: 400,
  [TextWeight.Medium]: 500,
  [TextWeight.Semibold]: 600,
  [TextWeight.Bold]: 700,
};

export const StyledTextTag = styled(TextTag)`
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  ${props => sizeCss[props.$size ?? TextSize.M2]}

  font-weight: ${props => weightCss[props.$weight ?? TextWeight.Medium]};

  color: ${props => props.theme.colors[props.$color ?? TextColor.Stroke]};
`;
