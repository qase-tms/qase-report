export enum Color {
  Red = 'red',
  Green = 'green',
  Cyan = 'cyan',
  Violet = 'violet',
  Blue = 'blue',
  Background = 'background',
  Stroke = 'stroke',
  Orange = 'orange',
}

const LightThemeColors: Record<Color, string> = {
  [Color.Red]: '#D0001B',
  [Color.Green]: '#29B95F',
  [Color.Cyan]: '#32425F',
  [Color.Orange]: '#FC9033',
  [Color.Violet]: '#5F01B9',
  [Color.Blue]: '#1E54C5',
  [Color.Background]: '#F4F5F7',
  [Color.Stroke]: '#32425F',
};

const NightThemeColors: Record<Color, string> = {
  [Color.Red]: '#ED5859',
  [Color.Green]: '#29B95F',
  [Color.Cyan]: '#32425F',
  [Color.Violet]: '#5F01B9',
  [Color.Orange]: '#FC9033',
  [Color.Blue]: '#5E9DDC',
  [Color.Background]: '#8C8F99',
  [Color.Stroke]: '#F8FAFD',
};

export enum Themes {
  Light = 'light',
  Night = 'night',
}

export type StyledTheme = {
  colors: Record<Color, string>;
};

export const themes: Record<Themes, StyledTheme> = {
  light: {
    colors: LightThemeColors,
  },
  night: {
    colors: NightThemeColors,
  },
};
