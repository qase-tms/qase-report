import { IconNames } from './types';
import logoSrc from './resources/logo.svg';
import calendarSrc from './resources/calendar.svg';
import checkmarkSrc from './resources/checkmark.svg';
import clockSrc from './resources/clock.svg';
import failSrc from './resources/fail.svg';
import settingsSrc from './resources/settings.svg';

export const IconSources: Record<IconNames,string> = {
    [IconNames.Logo]: logoSrc,
    [IconNames.Calendar]: calendarSrc,
    [IconNames.CheckMark]: checkmarkSrc,
    [IconNames.Clock]: clockSrc,
    [IconNames.Fail]: failSrc,
    [IconNames.Settings]: settingsSrc
};