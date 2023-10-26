import {FC, PropsWithChildren, useState, useRef, useEffect} from 'react';
import { Spacer, SpacerDirections, SpacerPreset } from 'components/spacer/spacer';
import cn from 'classnames';
import styles from './side-panel.module.css';
import { useTestIdAttribute } from 'utils/use-test-id-attribute';

type PanelProps = PropsWithChildren<{
    opened: boolean,
    testId?: string
}>

export const SidePanel:FC<PanelProps> = (props) => {
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [isOpened, setIsOpened] = useState<boolean>(false)
    const panelRef = useRef<HTMLDivElement>(null);
    const testIdAttribute = useTestIdAttribute(props.testId);

    useEffect(() => {
        const onTransitionEnd = () => {
            setIsAnimating(false);
        };
        if(panelRef.current) {
            panelRef.current.addEventListener('transitionend', onTransitionEnd);
        }
        return () => {
            panelRef.current?.removeEventListener('transitionend', onTransitionEnd);
        }
    }, [panelRef.current]);

    useEffect(() => {
        if(!isAnimating && props.opened !== isOpened) {
            setIsOpened(props.opened);
            setIsAnimating(true);
        }
    }, [props.opened, isAnimating]);

    return (
        <Spacer ref={panelRef} fullHeight direction={SpacerDirections.Column} preset={SpacerPreset.BorderedLeft} className={cn(styles.panel, {
            [styles.opened]: isOpened
        })}
        {...testIdAttribute}
        >
            {props.children}
        </Spacer>
    )
};
