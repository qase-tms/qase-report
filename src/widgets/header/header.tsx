import {FC} from 'react';
import { Icon } from 'components/icon';
import { Divider } from 'components/divider';
import { Text } from 'components/text';
import { Spacer } from 'components/spacer';

const headerCss = `
    background-color: white;
    padding: 16px 18px;
`;

export const Header: FC = () => {
    return (
        <Spacer gap={6} preset={Spacer.Preset.Shaded} css={headerCss} align={Spacer.Align.End} fullWidth>
            <Icon iconName={Icon.Name.Logo} />
            <Divider />
            <Text size={Text.Size.M1} tagName='p' color={Text.Color.Secondary}>Report</Text>
        </Spacer>
    )
};