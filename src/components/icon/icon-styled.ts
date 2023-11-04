import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconSize } from './icon-types';
import styled from 'styled-components';
import { Color } from 'constants/colors';

export const Img = styled.img<{ $size?: IconSize; $css?: string }>`
  ${props => (props.$size === IconSize.M ? 'height: 20px;' : '')}
  ${props => (props.$size === IconSize.S ? 'height: 14px;' : '')}
    ${props => props.$css ?? ''}
`;

type StyledProps = {
  $size?: IconSize;
  $color?: Color;
  $css?: string;
};

export const StyledFontAwesome = styled(FontAwesomeIcon)<StyledProps>`
  ${props => (props.$size === IconSize.M ? 'font-size: 20px;' : '')}
  ${props => (props.$size === IconSize.S ? 'font-size: 14px;' : '')}
    color: ${props => props.theme.colors[props.$color ?? Color.Stroke]};
  ${props => props.$css ?? ''};
`;
