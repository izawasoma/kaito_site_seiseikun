import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  :root {
    font-family: "Noto Sans JP", sans-serif;
    font-weight: ${({ theme }) => theme.fontWeights.regular};
    color: ${({ theme }) => theme.colors.black};
    background-color: ${({ theme }) => theme.colors.white};
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }

  #root {
    min-height: 100vh;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  button {
    transition: opacity 0.2s ease;
  }

  @media (hover: hover) {
    button:hover:not(:disabled):not([aria-disabled="true"]):not([data-disabled]) {
      opacity: 0.7;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    button { transition: none; }
  }
`;

export default GlobalStyle;
