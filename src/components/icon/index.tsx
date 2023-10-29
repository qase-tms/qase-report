import { FC } from 'react';
import { Icon as IconComponent, IconProps } from './icon';
import { IconName, IconSize } from './icon-types';

type IconComponentType = FC<IconProps> & {
    Name: typeof IconName,
    Size: typeof IconSize
}

export const Icon: IconComponentType = (props) => <IconComponent {...props} />;

Icon.Name = IconName;
Icon.Size = IconSize;