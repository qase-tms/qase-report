import {FC} from 'react';
import { Icon, IconNames } from 'components/icon/icon';
import { Divider } from 'components/divider/divider';
import { Text, TextColor, TextSizes } from 'components/text/text';
import { Spacer, SpacerAlign, SpacerPreset } from 'components/spacer/spacer';

const headerCss = `
    background-color: white;
    padding: 16px 18px;
`;

export const Header: FC = () => {
    return (
        <Spacer gap={6} preset={SpacerPreset.Shaded} css={headerCss} align={SpacerAlign.End} fullWidth>
            <Icon iconName={IconNames.Logo} />
            <Divider />
            <Text size={TextSizes.M1} tagName='p' color={TextColor.Secondary}>Report</Text>
        </Spacer>
    )
}