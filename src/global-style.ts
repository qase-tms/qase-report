import { createGlobalStyle } from 'styled-components';
import 'react-virtualized/styles.css';

export const GlobalStyle = createGlobalStyle`
:root {
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-weight: 500;
  
    color: #32425F;;
    background-color: white;
    box-sizing: border-box;
  
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
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


::-webkit-scrollbar {
    width: 12px;
}
 
::-webkit-scrollbar-track {
    border: none;
}
 
::-webkit-scrollbar-thumb {
    background-color: #818B99;
    border: 5px solid transparent;
    border-radius: 9px;
    background-clip: content-box;
}
`;
