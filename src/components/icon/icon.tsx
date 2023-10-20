import { FC } from 'react';
import styles from './icon.module.css';
import { IconNames, IconSizes } from './types';
import { IconSources } from './icon-sources';
import cn from 'classnames';

type IconProps = {
    iconName: IconNames,
    size?: IconSizes,
    className?: string
}

export const Icon: FC<IconProps> = ({iconName, size, className}) => {
    return (
       <img 
       src={IconSources[iconName]} 
       className={cn(className, {
        [styles[`icon-size-${size}`]]: Boolean(size)
       })}
        />
    );
};

export { IconNames, IconSizes };