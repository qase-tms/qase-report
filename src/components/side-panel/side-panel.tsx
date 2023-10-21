import {FC, PropsWithChildren} from 'react';
import { Spacer, SpacerDirections, SpacerPreset } from 'components/spacer/spacer';
import styles from './side-panel.module.css';

export const SidePanel:FC<PropsWithChildren> = ({children}) => {
    return (
        <Spacer fullHeight direction={SpacerDirections.Column} preset={SpacerPreset.BorderedLeft} className={styles.panel}>
            {children}
        </Spacer>
    )
};
