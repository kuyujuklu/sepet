"use client"

import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext({
  theme: "light",
  textColor: "#000000",
  bgColor: "#ecfeff",
});

export const PubColorContext = createContext("");

const ThemeContextProvider = ({ data, children }) => {
  const [pubColorValue, setPubColorValue] = useState("#ffffff");

  const [theme, setTheme] = useState({
    theme: "light",
    textColor: "#000000",
    bgColor: "#ffffff",
  });

  useEffect(() => {
    if (data?.pub) {
      if (data.pub.color_theme === "dark") {
        setTheme({
          theme: "dark",
          textColor: "#eeefff",
          bgColor: "rgb(17 24 39)",
        });
        setPubColorValue(data.pub.color ?? "#eeefff");
        let htmlNode = document.querySelector("html");
        if (htmlNode) htmlNode = "rgb(17 24 39)";
      } else {
        setTheme({
          theme: "light",
          textColor: "#000000",
          bgColor: "#eeefff",
        });
        setPubColorValue(data.pub.color ?? "#000000");
        let htmlNode = document.querySelector("html");
        if (htmlNode) htmlNode = "#cccccc";
      }
    }
  }, [data?.pub]);

  return (
    <ThemeContext.Provider value={theme}>
      <PubColorContext.Provider
        value={pubColorValue}
      >
        {children}
      </PubColorContext.Provider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
