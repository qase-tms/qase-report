import { FC } from 'react';
import { IconName, IconSize } from './icon-types';
import { IconSources } from './icon-sources';
import { useTestIdAttribute } from 'utils/use-test-id-attribute';
import styled from 'styled-components';

type IconProps = {
    iconName: IconName,
    size?: IconSize,
    css?: string,
    testId?: string
};

const Img = styled.img<{$size?: IconSize, $css?: string}>`
    ${props => props.$size === IconSize.M ?  'height: 20px;' : ''}
    ${props => props.$size === IconSize.S ?  'height: 12px;' : ''}
    ${props => props.$css ?? ''}
`;

type IconComponent =  FC<IconProps> & {
    Name: typeof IconName,
    Size: typeof IconSize
}

export const Icon: IconComponent = ({iconName, size, css, testId}) => {
    const testIdAttribute = useTestIdAttribute(testId);
    return (
       <Img $size={size} $css={css} {...testIdAttribute} src={IconSources[iconName]} />
    );
};

Icon.Name = IconName;
Icon.Size = IconSize;