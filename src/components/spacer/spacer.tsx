import {PropsWithChildren, forwardRef} from 'react';
import { useTestIdAttribute } from 'utils/use-test-id-attribute';
import styled from 'styled-components';

export enum SpacerPreset {
    Shaded='shaded',
    BorderedBottom='bordered-bottom',
    BorderedLeft='bordered-left'
};

export enum SpacerAlign {
    Start='start',
    Center='center',
    End='end'
};

export enum SpacerDirections {
    Row='row',
    Column='column'
}

export enum SpacerJustify {
    SpaceBetween='space-between'
}

type SpacerProps = PropsWithChildren<{
    preset?: SpacerPreset,
    align?: SpacerAlign,
    gap?: number,
    direction?: SpacerDirections,
    justifyContent?: SpacerJustify
    fullWidth?: boolean,
    fullHeight?: boolean,
    onClick?: (d: any) => void,
    testId?: string,
    css?: string
}>;

type StyledDivProps = Omit<SpacerProps, 'onClick'|'testId'>

const presetCss: Record<SpacerPreset, string> = {
    [SpacerPreset.Shaded]: `box-shadow: 0px 0px 1px 0px rgba(9, 30, 66, 0.31), 0px 0px 4px 0px rgba(9, 30, 66, 0.25);`,
    [SpacerPreset.BorderedBottom]: `border-bottom: 1px solid rgba(50, 66, 95, 0.17);`,
    [SpacerPreset.BorderedLeft]: `border-left: 1px solid #E0E1E4;`
};

const alignCss: Record<SpacerAlign, string> = {
    [SpacerAlign.Center]: 'align-items: center;',
    [SpacerAlign.End]: 'align-items: flex-end;',
    [SpacerAlign.Start]: 'align-items: flex-start;'
};

const directionCss: Record<SpacerDirections, string> = {
    [SpacerDirections.Column]: 'flex-direction: column;',
    [SpacerDirections.Row]: 'flex-direction: row;',
};

const justifyCss: Record<SpacerJustify, string> = {
    [SpacerJustify.SpaceBetween]: 'justify-content: space-between;'
};


const Div = styled.div<StyledDivProps>`
    display: flex;
    box-sizing: border-box;
    
    ${props => props.preset ? presetCss[props.preset]: '' }

    ${props => alignCss[props.align ?? SpacerAlign.Center]}

    ${props => directionCss[props.direction ?? SpacerDirections.Row]}

    ${props => props.justifyContent ? justifyCss[props.justifyContent] : ''}

    ${props => props.gap ? `gap: ${props.gap}px;` : ''}

    ${props => props.fullWidth ? 'width: 100%;' : ''}

    ${props => props.fullHeight ? 'height: 100%;' : ''}

    ${props => props.css ?? ''}
`;

export const Spacer = forwardRef<HTMLDivElement, SpacerProps>(({children, gap, align, preset, direction, justifyContent, fullWidth, css, fullHeight, onClick, testId}, ref) => {
    const testIdAttribute = useTestIdAttribute(testId);
    return (
        <Div
          ref={ref}
          {...testIdAttribute}
          onClick={onClick}
          preset={preset}
          align={align}
          direction={direction}
          gap={gap}
          css={css}
          justifyContent={justifyContent}
          fullWidth={fullWidth}
          fullHeight={fullHeight}>
            {children}
        </Div>
    );
});