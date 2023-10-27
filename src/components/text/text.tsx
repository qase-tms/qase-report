import { FC, PropsWithChildren } from 'react';
import { useTestIdAttribute } from 'utils/use-test-id-attribute';
import styled from 'styled-components';

export enum TextSizes {
    S1='s1',
    M1='m1',
    M2='m2',
    L1='l1'
};

export enum TextWeight {
    Bold='bold',
    Semibold='semibold',
    Medium='medium',
    Normal='normal'
};

export enum TextColor {
    Primary='primary',
    Secondary='secondary',
    Success='success',
    Error='error'
}

type TextProps = PropsWithChildren<{
    size?: TextSizes,
    weight?: TextWeight,
    tagName?: 'span'|'p'|'h1'|'h2'|'h3'|'h4'|'h5',
    css?: string,
    color?: TextColor,
    testId?: string
}>;

const TextTag:FC<TextProps> = ({tagName="span", ...rest}) => {
    const Tag = tagName;
    return (
        <Tag {...rest}/>
     );
};

const sizeCss:Record<TextSizes, string> = {
    [TextSizes.S1]: `
        font-size: 12px;
        line-height: 12px;
    `,
    [TextSizes.M1]: `
        font-size: 14px;
        line-height: 14px;
    `,
    [TextSizes.M2]: `
        font-size: 16px;
        line-height: 16px;
    `,
    [TextSizes.L1]: `
        font-size: 24px;
        line-height: 24px;
    `
};

const weightCss:Record<TextWeight,string> = {
    [TextWeight.Normal]: 'text-weight: 400;',
    [TextWeight.Medium]: 'text-weight: 500;',
    [TextWeight.Semibold]: 'text-weight: 600;',
    [TextWeight.Bold]: 'text-weight: 700;',
};

const colorCss:Record<TextColor,string> = {
    [TextColor.Error]: 'color: rgba(208, 0, 27, 1);',
    [TextColor.Primary]: 'color: #32425F;',
    [TextColor.Secondary]: 'color: rgba(50, 66, 95, 0.87);',
    [TextColor.Success]: 'color: #29B95F;'
};

const StyledTextTag = styled(TextTag)`
    font-family: 'SF Pro', Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    ${props => sizeCss[props.size ?? TextSizes.M2]}

    ${props => weightCss[props.weight ?? TextWeight.Medium]}

    ${props => colorCss[props.color ?? TextColor.Primary]}

    ${props => props.css ?? ''}
`;

export const Text:FC<TextProps> = ({ size, weight, children, tagName='span', css, color, testId}) => {
    const testIdAttribute = useTestIdAttribute(testId);
    return (
        <StyledTextTag 
        size={size}
        weight={weight}
        tagName={tagName}
        css={css}
        color={color}
         {...testIdAttribute}>
            {children}
        </StyledTextTag>
     );
}