import { FC, PropsWithChildren } from 'react';
import cn from 'classnames';
import styles from './text.module.css';

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
    Secondary='secondary'
}

type TextProps = PropsWithChildren<{
    size?: TextSizes,
    weight?: TextWeight,
    tagName?: 'span'|'p'|'h1'|'h2'|'h3'|'h4'|'h5',
    className?: string,
    color?: TextColor
}>;

export const Text:FC<TextProps> = ({ size=TextSizes.M2, weight=TextWeight.Medium, children, tagName='span', className, color=TextColor.Primary}) => {
    const Tag = tagName;
    return <Tag className={cn(styles.text, styles[`text-weight-${weight}`], styles[`text-size-${size}`], styles[`text-color-${color}`], className)}>{children}</Tag>
}