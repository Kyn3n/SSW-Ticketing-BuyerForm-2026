"use client";

import { Theme } from "@astryxdesign/core";
import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { sswTheme } from "@/lib/astryx-theme";

export type ThemeModeValue = "light" | "dark";
const STORAGE_KEY = "ssw-theme-mode";

type ThemeModeContextValue = {
  mode: ThemeModeValue;
  toggle: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeModeValue>("dark");

  // Restore the persisted preference after mount, once, so the server-
  // rendered "dark" default never mismatches the client's first paint.
  useLayoutEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // One-time hydration of a persisted preference, not a render loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "light") setMode("light");
  }, []);

  function toggle() {
    setMode((current) => {
      const next = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }

  return (
    <ThemeModeContext.Provider value={{ mode, toggle }}>
      <Theme theme={sswTheme} mode={mode}>
        {children}
      </Theme>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeModeProvider");
  }
  return context;
}
