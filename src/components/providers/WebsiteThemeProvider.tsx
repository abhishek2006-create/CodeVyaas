"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { themes, defaultWebsiteTheme } from "@/config/themes";

export type ColorMode = "light" | "dark" | "system";

interface WebsiteThemeContextType {
  websiteTheme: string;
  setWebsiteTheme: (theme: string) => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  resolvedColorMode: "light" | "dark";
}

const WebsiteThemeContext = createContext<WebsiteThemeContextType | undefined>(undefined);

export function WebsiteThemeProvider({ children }: { children: React.ReactNode }) {
  const [websiteTheme, setWebsiteTheme] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("website-theme") || defaultWebsiteTheme;
    }
    return defaultWebsiteTheme;
  });

  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("color-mode") as ColorMode) || "system";
    }
    return "system";
  });

  const [systemMode, setSystemMode] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemMode(mediaQuery.matches ? "dark" : "light");

    const handler = (e: MediaQueryListEvent) => setSystemMode(e.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const resolvedColorMode = useMemo(() => {
    if (colorMode === "system") return systemMode;
    return colorMode;
  }, [colorMode, systemMode]);

  const variables = useMemo(() => {
    const themeDef = themes[websiteTheme] || themes[defaultWebsiteTheme];
    return resolvedColorMode === "dark" ? themeDef.dark : themeDef.light;
  }, [websiteTheme, resolvedColorMode]);

  useEffect(() => {
    localStorage.setItem("website-theme", websiteTheme);
    localStorage.setItem("color-mode", colorMode);

    const root = document.documentElement;
    
    // Apply all variables from the theme
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Also update the 'dark' class for libraries that depend on it
    if (resolvedColorMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [websiteTheme, colorMode, resolvedColorMode, variables]);

  const value = useMemo(
    () => ({
      websiteTheme,
      setWebsiteTheme,
      colorMode,
      setColorMode,
      resolvedColorMode,
    }),
    [websiteTheme, colorMode, resolvedColorMode]
  );

  return <WebsiteThemeContext.Provider value={value}>{children}</WebsiteThemeContext.Provider>;
}

export function useWebsiteTheme() {
  const context = useContext(WebsiteThemeContext);
  if (context === undefined) {
    throw new Error("useWebsiteTheme must be used within a WebsiteThemeProvider");
  }
  return context;
}
