import { FC } from 'react';
import styles from './icon.module.css';
import { IconNames, IconSizes } from './types';
import { IconSources } from './icon-sources';
import cn from 'classnames';
import { useTestIdAttribute } from 'utils/use-test-id-attribute';

type IconProps = {
    iconName: IconNames,
    size?: IconSizes,
    className?: string,
    testId?: string
}

export const Icon: FC<IconProps> = ({iconName, size, className, testId}) => {
    const testIdAttribute = useTestIdAttribute(testId);
    return (
       <img
       {...testIdAttribute} 
       src={IconSources[iconName]} 
       className={cn(className, {
        [styles[`icon-size-${size}`]]: Boolean(size)
       })}
        />
    );
};

export { IconNames, IconSizes };