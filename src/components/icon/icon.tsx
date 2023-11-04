import { FC } from 'react';
import { IconName, IconSize, IconType, AwesomeIconOptions, LocalIconOptions } from './icon-types';
import { iconOptions } from './icon-sources';
import { useTestIdAttribute } from 'utils/use-test-id-attribute';
import { Img, StyledFontAwesome } from './icon-styled';

export type IconProps = {
  iconName: IconName;
  size?: IconSize;
  testId?: string;
};

export const Icon: FC<IconProps> = ({ iconName, size, testId }) => {
  const testIdAttribute = useTestIdAttribute(testId);
  if (iconOptions[iconName].type === IconType.FontAwesome) {
    const { icon, color } = iconOptions[iconName] as AwesomeIconOptions;
    return <StyledFontAwesome icon={icon} $size={size} $color={color} {...testIdAttribute} />;
  }
  const iconSrc = (iconOptions[iconName] as LocalIconOptions).src;
  return <Img $size={size} {...testIdAttribute} src={iconSrc} />;
};
