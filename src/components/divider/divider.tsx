import {FC} from 'react';
import cn from 'classnames';
import styles from './divider.module.css';
import { useTestIdAttribute } from 'utils/use-test-id-attribute';

type DividerProps = {
    className?: string,
    testId?: string
}

export const Divider: FC<DividerProps> = ({className, testId}) => {
    const testIdAttribute = useTestIdAttribute(testId);
    return (<div className={cn(styles.divider, className)} {...testIdAttribute}/>)
}