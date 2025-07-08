
// src/styles/GlobalStyles.js
import { createGlobalStyle } from 'styled-components';

/**
 * Global styles for the Messa Di Voce application.
 * This component sets up basic typography, background, and root element styling.
 * It ensures a consistent look and feel across the application.
 */
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

  body {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #0a0a1a, #1a1a3a); /* Deeper, more vibrant gradient */
    margin: 0;
    color: white;
  }

  #root {
    width: 100%;
    /* Removed height: 100%; display: flex; justify-content: center; align-items: center;
       These properties are now managed by AppContainer to allow proper scrolling. */
  }
`;

export default GlobalStyle;
