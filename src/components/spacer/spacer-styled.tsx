import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { SpacerAlign, SpacerDirection, SpacerJustify, SpacerPreset } from './spacer-types';

type StyledDivProps = PropsWithChildren<{
  $preset?: SpacerPreset;
  $align?: SpacerAlign;
  $gap?: number;
  $direction?: SpacerDirection;
  $justifyContent?: SpacerJustify;
  $fullWidth?: boolean;
  $fullHeight?: boolean;
  $css?: string;
}>;

const presetCss: Record<SpacerPreset, string> = {
  [SpacerPreset.Shaded]: `box-shadow: 0px 0px 1px 0px rgba(9, 30, 66, 0.31), 0px 0px 4px 0px rgba(9, 30, 66, 0.25);`,
  [SpacerPreset.BorderedBottom]: `border-bottom: 1px solid rgba(50, 66, 95, 0.17);`,
  [SpacerPreset.BorderedLeft]: `border-left: 1px solid #E0E1E4;`,
};

const alignCss: Record<SpacerAlign, string> = {
  [SpacerAlign.Center]: 'align-items: center;',
  [SpacerAlign.End]: 'align-items: flex-end;',
  [SpacerAlign.Start]: 'align-items: flex-start;',
};

const directionCss: Record<SpacerDirection, string> = {
  [SpacerDirection.Column]: 'flex-direction: column;',
  [SpacerDirection.Row]: 'flex-direction: row;',
};

const justifyCss: Record<SpacerJustify, string> = {
  [SpacerJustify.SpaceBetween]: 'justify-content: space-between;',
};

export const StyledSpacer = styled.div<StyledDivProps>`
  display: flex;
  box-sizing: border-box;

  ${props => (props.$preset ? presetCss[props.$preset] : '')}

  ${props => alignCss[props.$align ?? SpacerAlign.Center]}

    ${props => directionCss[props.$direction ?? SpacerDirection.Row]}

    ${props => (props.$justifyContent ? justifyCss[props.$justifyContent] : '')}

    ${props => (props.$gap ? `gap: ${props.$gap}px;` : '')}

    ${props => (props.$fullWidth ? 'width: 100%;' : '')}

    ${props => (props.$fullHeight ? 'height: 100%;' : '')}

    ${props => props.$css ?? ''}
`;
