import {FC} from 'react';
import cn from 'classnames';
import styles from './divider.module.css';

type DividerProps = {
    className?: string
}

export const Divider: FC<DividerProps> = ({className}) => {
    return (<div className={cn(styles.divider, className)} />)
}