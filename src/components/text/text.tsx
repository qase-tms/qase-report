import { FC, PropsWithChildren } from 'react';
import { useTestIdAttribute } from 'utils/use-test-id-attribute';
import { TextSize, TextWeight, TextColor } from './text-types';
import { StyledTextTag } from './text-styled';

type TextProps = PropsWithChildren<{
    size?: TextSize,
    weight?: TextWeight,
    tagName?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5',
    css?: string,
    color?: TextColor,
    testId?: string
}>;

type TextComponent = FC<TextProps> & {
    Size: typeof TextSize,
    Weight: typeof TextWeight,
    Color: typeof TextColor
};

export const Text: TextComponent = ({ size, weight, children, tagName = 'span', css, color, testId }) => {
    const testIdAttribute = useTestIdAttribute(testId);
    return (
        <StyledTextTag
            $size={size}
            $weight={weight}
            tagName={tagName}
            $css={css}
            $color={color}
            {...testIdAttribute}>
            {children}
        </StyledTextTag>
    );
}

Text.Color = TextColor;
Text.Weight = TextWeight;
Text.Size = TextSize;