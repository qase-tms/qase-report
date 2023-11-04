import { PropsWithChildren, FC } from 'react';
import { useTestIdAttribute } from 'utils/use-test-id-attribute';
import { SpacerAlign, SpacerDirection, SpacerJustify, SpacerPreset } from './spacer-types';
import { StyledSpacer } from './spacer-styled';

type SpacerProps = PropsWithChildren<{
  preset?: SpacerPreset;
  align?: SpacerAlign;
  gap?: number;
  direction?: SpacerDirection;
  justifyContent?: SpacerJustify;
  fullWidth?: boolean;
  fullHeight?: boolean;
  onClick?: (d: any) => void;
  testId?: string;
  css?: string;
}>;

type SpacerComponent = FC<SpacerProps> & {
  Preset: typeof SpacerPreset;
  Align: typeof SpacerAlign;
  Direction: typeof SpacerDirection;
  Justify: typeof SpacerJustify;
};

export const Spacer: SpacerComponent = ({
  children,
  gap,
  align,
  preset,
  direction,
  justifyContent,
  fullWidth,
  css,
  fullHeight,
  onClick,
  testId,
}) => {
  const testIdAttribute = useTestIdAttribute(testId);
  return (
    <StyledSpacer
      {...testIdAttribute}
      onClick={onClick}
      $preset={preset}
      $align={align}
      $direction={direction}
      $gap={gap}
      $css={css}
      $justifyContent={justifyContent}
      $fullWidth={fullWidth}
      $fullHeight={fullHeight}
    >
      {children}
    </StyledSpacer>
  );
};

Spacer.Preset = SpacerPreset;
Spacer.Align = SpacerAlign;
Spacer.Direction = SpacerDirection;
Spacer.Justify = SpacerJustify;
