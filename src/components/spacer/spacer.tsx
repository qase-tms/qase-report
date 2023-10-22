import {FC, PropsWithChildren, forwardRef} from 'react';
import styles from './spacer.module.css';
import cn from 'classnames';

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

export enum SpacerGaps {
    M='m',
    S='s',
    XS='xs'
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
    gap?: SpacerGaps,
    direction?: SpacerDirections,
    justifyContent?: SpacerJustify
    fullWidth?: boolean,
    fullHeight?: boolean,
    className?: string,
    onClick?: (d: any) => void
}>;

export const Spacer = forwardRef<HTMLDivElement, SpacerProps>(({children, gap, align=SpacerAlign.Center, preset, direction=SpacerDirections.Row, justifyContent, fullWidth, className, fullHeight, onClick}, ref) => {
    return (
        <div
          ref={ref}
          onClick={onClick}
          className={cn(className, styles.spacer, styles[`spacer-align-${align}`], styles[`spacer-direction-${direction}`], {
            [styles[`spacer-preset-${preset}`]]: Boolean(preset),
            [styles[`spacer-gaps-${gap}`]]: Boolean(gap),
            [styles[`spacer-justify-${justifyContent}`]]: Boolean(justifyContent),
            [styles['spacer-fullwidth']]: Boolean(fullWidth),
            [styles['spacer-fullheight']]: Boolean(fullHeight)
          })}>
            {children}
        </div>
    );
});