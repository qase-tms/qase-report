import {FC, PropsWithChildren} from 'react';
import styles from './spacer.module.css';
import cn from 'classnames';

export enum SpacerPreset {
    Shaded='shaded',
    Bordered='bordered'
};

export enum SpacerAlign {
    Top='top',
    Center='center',
    Bottom='bottom'
};

export enum SpacerGaps {
    M='m'
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
    className?: string
}>;

export const Spacer: FC<SpacerProps> = ({children, gap, align=SpacerAlign.Center, preset, direction=SpacerDirections.Row, justifyContent, fullWidth, className}) => {
    return (
        <div
          className={cn(className, styles.spacer, styles[`spacer-align-${align}`], styles[`spacer-direction-${direction}`], {
            [styles[`spacer-preset-${preset}`]]: Boolean(preset),
            [styles[`spacer-gaps-${gap}`]]: Boolean(gap),
            [styles[`spacer-justify-${justifyContent}`]]: Boolean(justifyContent),
            [styles['spacer-fullwidth']]: Boolean(fullWidth)
          })}>
            {children}
        </div>
    );
};