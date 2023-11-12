import { IconName, IconOptions, IconType } from './icon-types';
import logoSrc from './resources/logo.svg';
import settingsSrc from './resources/settings.svg';
import exclamationSrc from './resources/exclamation.svg';
import { faClock, faCalendar, faFile } from '@fortawesome/free-regular-svg-icons';
import {
  faSquareCheck,
  faSquareXmark,
  faSquareMinus,
  faAngleDown,
  faAngleRight,
} from '@fortawesome/free-solid-svg-icons';
import { Color } from 'constants/colors';

export const iconOptions: Record<IconName, IconOptions> = {
  [IconName.CheckMark]: {
    type: IconType.FontAwesome,
    icon: faSquareCheck,
    color: Color.Green,
  },
  [IconName.Calendar]: {
    type: IconType.FontAwesome,
    icon: faCalendar,
    color: Color.Stroke,
  },
  [IconName.Clock]: {
    type: IconType.FontAwesome,
    icon: faClock,
    color: Color.Stroke,
  },
  // Pro Icon
  [IconName.Exclamation]: {
    type: IconType.Local,
    src: exclamationSrc,
  },
  [IconName.Fail]: {
    type: IconType.FontAwesome,
    icon: faSquareXmark,
    color: Color.Red,
  },
  [IconName.Minus]: {
    type: IconType.FontAwesome,
    icon: faSquareMinus,
    color: Color.Cyan,
  },
  [IconName.AngleDown]: {
    type: IconType.FontAwesome,
    icon: faAngleDown,
    color: Color.Stroke,
  },
  [IconName.AngleRight]: {
    type: IconType.FontAwesome,
    icon: faAngleRight,
    color: Color.Stroke,
  },
  [IconName.File]: {
    type: IconType.FontAwesome,
    icon: faFile,
    color: Color.Stroke,
  },
  // Pro Icon
  [IconName.Settings]: {
    type: IconType.Local,
    src: settingsSrc,
  },
  // Local Icon
  [IconName.Logo]: {
    type: IconType.Local,
    src: logoSrc,
  },
};
