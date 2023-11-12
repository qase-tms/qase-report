import ReactDOM from 'react-dom/client';
import { App } from './app';
import { qaseJsonp } from 'utils/jsonp/qase-jsonp';
import { GlobalStyle } from './global-style';
import { ThemeProvider } from 'styled-components';
import { Themes, themes } from 'constants/colors';
import { ParamsProvider } from 'domain/hooks/use-params';

declare global {
  interface Window {
    qaseJsonp: (d: any) => void;
  }
}

window.qaseJsonp = qaseJsonp;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ParamsProvider>
    <ThemeProvider theme={themes[Themes.Light]}>
      <GlobalStyle />
      <App />
    </ThemeProvider>
  </ParamsProvider>,
);
