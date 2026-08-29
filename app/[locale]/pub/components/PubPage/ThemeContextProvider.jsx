"use client"

import { createContext } from "react";

// Always the agreed Sepet palette now - restaurants used to be able to pick
// their own brand color/dark-mode via `pub.color`/`pub.color_theme`, which
// meant the redesign's blue/green system randomly got overridden (a red
// brand color + forced dark theme on one pub was reported as "wrong
// colors"). One consistent look across every pub page beats a per-pub
// custom theme now that the whole site follows one design.
const FIXED_THEME = {
  theme: "light",
  textColor: "#1c2733",
  bgColor: "#ffffff",
};

export const ThemeContext = createContext(FIXED_THEME);

const ThemeContextProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={FIXED_THEME}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
