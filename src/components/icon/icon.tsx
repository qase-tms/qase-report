import { FC } from 'react';
import { IconNames, IconSizes } from './types';
import { IconSources } from './icon-sources';
import { useTestIdAttribute } from 'utils/use-test-id-attribute';
import styled from 'styled-components';

type IconProps = {
    iconName: IconNames,
    size?: IconSizes,
    css?: string,
    testId?: string
};

const Img = styled.img<{size?: IconSizes, css?: string}>`
    ${props => props.size === IconSizes.M ?  'height: 20px;' : ''}
    ${props => props.size === IconSizes.S ?  'height: 12px;' : ''}
    ${props => props.css ?? ''}
`;

export const Icon: FC<IconProps> = ({iconName, size, css, testId}) => {
    const testIdAttribute = useTestIdAttribute(testId);
    return (
       <Img size={size} css={css} {...testIdAttribute} src={IconSources[iconName]} />
    );
};

export { IconNames, IconSizes };