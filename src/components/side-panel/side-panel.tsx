import {FC, PropsWithChildren, useState, useRef, useEffect} from 'react';
import { Spacer, SpacerDirections, SpacerPreset } from 'components/spacer/spacer';
import { useTestIdAttribute } from 'utils/use-test-id-attribute';

type PanelProps = PropsWithChildren<{
    opened: boolean,
    testId?: string
}>

const panelCss = (opened: boolean) => `
    position: fixed;
    min-width: 300px;
    top: 60px;
    right: 0;
    height: calc(100vh - 60px);
    transition: transform 0.2s;
    background-color: white;
    transform: translateX(${opened ? 0 : '100%'});
`;

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
        <Spacer ref={panelRef} fullHeight direction={SpacerDirections.Column} preset={SpacerPreset.BorderedLeft} css={panelCss(isOpened)}
        {...testIdAttribute}
        >
            {props.children}
        </Spacer>
    )
};
