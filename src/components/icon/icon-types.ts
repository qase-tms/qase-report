import { Color } from 'src/constants/colors';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export enum IconName {
  Logo = 'logo',
  Clock = 'clock',
  CheckMark = 'check-mark',
  Fail = 'fail',
  Calendar = 'calendar',
  Settings = 'settings',
  Exclamation = 'exclamation',
  Minus = 'minus',
}

export enum IconType {
  Local = 'local',
  FontAwesome = 'fontawesome',
}

export type AwesomeIconOptions = {
  type: IconType.FontAwesome;
  icon: IconDefinition;
  color: Color;
};

export type LocalIconOptions = {
  type: IconType.Local;
  src: string;
};

export type IconOptions = LocalIconOptions | AwesomeIconOptions;

export enum IconSize {
  M = 'm',
  S = 's',
  XS = 'xs',
}
