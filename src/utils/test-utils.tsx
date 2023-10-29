import {render} from '@testing-library/react';
import { themes, Themes } from 'constants/colors';
import { ThemeProvider } from 'styled-components';

export const expectPropsPassed = (Component: jest.Mock, props: object) => {
    const callsidx = Component.mock.calls.length - 1;
    expect(Component.mock.calls[callsidx][0]).toMatchObject(props);
};

export const expectPropsWasPassed = (Component: jest.Mock, props: object, callsidx: number) => {
    expect(Component.mock.calls[callsidx][0]).toMatchObject(props);
};

export const themedRender = (ui: React.ReactElement):void => {
    render(
        <ThemeProvider theme={themes[Themes.Light]}>
            {ui}
        </ThemeProvider>
    );
};