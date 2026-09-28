export const theme = {
  colors: {
    black: "#1D1D1D",
    deepGray: "#504B52",
    gray: "#8A8A8A",
    lightGray: "#ECECEC",
    veryLightGray: "#E1E7EF",
    white: "#ffffff",
    cloudyWhite: "#FBFCFE",
    red: "#F35457",
    lightRed: "#FCD0D1",
    yellow: "#E0B20C",
    green: "#30B73E",
    blue: "#5BA7FF",
    deepBlue: "#3071B7",
    purple: "#3E0B4D",
  },
  fontWeights: {
    thin: 100,
    extraLight: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
    extraBold: 800,
    black: 900,
  },
} as const;

export type AppTheme = typeof theme;
