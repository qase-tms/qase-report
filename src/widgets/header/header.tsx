import {FC} from 'react';
import { Icon, IconNames } from 'components/icon/icon';
import { Divider } from 'components/divider/divider';
import { Text, TextColor, TextSizes } from 'components/text/text';
import { Spacer, SpacerAlign, SpacerGaps, SpacerPreset } from 'components/spacer/spacer';
import cn from 'classnames';
import styles from './header.module.css';
import offsetStyles from 'common-styles/offsets.module.css';

export const Header: FC = () => {
    return (
        <Spacer gap={SpacerGaps.M} preset={SpacerPreset.Shaded} className={cn(offsetStyles['padding-16-18'], styles.header)} align={SpacerAlign.End} fullWidth>
            <Icon iconName={IconNames.Logo} />
            <Divider />
            <Text size={TextSizes.M1} tagName='p' color={TextColor.Secondary}>Report</Text>
        </Spacer>
    )
}