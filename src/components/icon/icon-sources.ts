import { IconName } from './icon-types';
import logoSrc from './resources/logo.svg';
import calendarSrc from './resources/calendar.svg';
import checkmarkSrc from './resources/checkmark.svg';
import clockSrc from './resources/clock.svg';
import failSrc from './resources/fail.svg';
import settingsSrc from './resources/settings.svg';

export const IconSources: Record<IconName,string> = {
    [IconName.Logo]: logoSrc,
    [IconName.Calendar]: calendarSrc,
    [IconName.CheckMark]: checkmarkSrc,
    [IconName.Clock]: clockSrc,
    [IconName.Fail]: failSrc,
    [IconName.Settings]: settingsSrc
};