import { FC, PropsWithChildren } from 'react';
import cn from 'classnames';
import styles from './text.module.css';

export enum TextSizes {
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

type TextProps = PropsWithChildren<{
    size?: TextSizes,
    weight?: TextWeight,
    tagName?: 'span'|'p'|'h1'|'h2'|'h3'|'h4'|'h5'
}>;

export const Text:FC<TextProps> = ({ size=TextSizes.M2, weight=TextWeight.Medium, children, tagName='span'}) => {
    const Tag = tagName;
    return <Tag className={cn(styles.text, styles[`text-weight-${weight}`], styles[`text-size-${size}`])}>{children}</Tag>
}