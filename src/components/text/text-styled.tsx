import { FC, PropsWithChildren } from 'react';
import { TextSize, TextWeight, TextColor } from './text-types';
import styled from 'styled-components';

type TextTagProps = PropsWithChildren<{
    $size?: TextSize,
    $weight?: TextWeight,
    tagName?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5',
    $css?: string,
    $color?: TextColor,
}>

const TextTag: FC<TextTagProps> = ({ tagName = "span", ...rest }) => {
    const Tag = tagName;
    const { $size, $weight, $css, $color, ...other } = rest;
    return (
        <Tag {...other} />
    );
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
        line-height: 24px;
    `
};

const weightCss: Record<TextWeight, string> = {
    [TextWeight.Normal]: 'text-weight: 400;',
    [TextWeight.Medium]: 'text-weight: 500;',
    [TextWeight.Semibold]: 'text-weight: 600;',
    [TextWeight.Bold]: 'text-weight: 700;',
};

const colorCss: Record<TextColor, string> = {
    [TextColor.Error]: 'color: rgba(208, 0, 27, 1);',
    [TextColor.Primary]: 'color: #32425F;',
    [TextColor.Secondary]: 'color: rgba(50, 66, 95, 0.87);',
    [TextColor.Success]: 'color: #29B95F;'
};

export const StyledTextTag = styled(TextTag)`
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    ${props => sizeCss[props.$size ?? TextSize.M2]}

    ${props => weightCss[props.$weight ?? TextWeight.Medium]}

    ${props => colorCss[props.$color ?? TextColor.Primary]}

    ${props => props.$css ?? ''}
`;