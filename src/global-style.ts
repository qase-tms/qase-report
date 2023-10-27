import { createGlobalStyle } from 'styled-components';
import sfProNormal from 'fonts/sf-pro/normal.otf';
import sfProMedium from 'fonts/sf-pro/medium.otf';
import sfProSemiBold from 'fonts/sf-pro/semibold.otf';
import sfProBold from 'fonts/sf-pro/bold.otf';

export const GlobalStyle = createGlobalStyle`
:root {
    font-family: 'SF Pro', Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    font-weight: 500;
  
    color: #32425F;;
    background-color: white;
  
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
  }
  
  @font-face {
     font-family: 'SF Pro';
     font-weight: 400;
     src: url(${sfProNormal});
  }
  
  @font-face {
    font-family: 'SF Pro';
    font-weight: 500;
    src: url(${sfProMedium});
  }
  
  @font-face {
    font-family: 'SF Pro';
    font-weight: 600;
    src: url(${sfProSemiBold});
  }
  
  @font-face {
    font-family: 'SF Pro';
    font-weight: 700;
    src: url(${sfProBold});
  }
  
  body {
    margin: 0;
    box-sizing: border-box;
  }
  
  p {
    margin-block-start: 0;
    margin-block-end: 0;
    margin-inline-start: 0;
    margin-inline-end: 0;
  }
  
  h1, h2, h3, h4, h5 {
    margin-block-start: 0;
    margin-block-end: 0;
  }
`;