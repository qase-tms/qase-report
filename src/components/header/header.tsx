import {FC} from 'react';
import styles from './header.module.css';
import { Logo } from 'components/logo/logo';
import { Divider } from 'components/divider/divider';
import { Text, TextSizes } from 'components/text/text';

export const Header: FC = () => {
    return (
        <div className={styles.panel}>
            <Logo />
            <Divider />
            <Text size={TextSizes.M1} tagName='p'>Report</Text>
        </div>
    )
}