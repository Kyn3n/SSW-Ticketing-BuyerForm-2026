"use client";

import { Theme, type ThemeMode } from "@astryxdesign/core";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { sswTheme } from "@/lib/ssw";

/** What the visitor has asked for. "system" is the default and defers to the OS. */
export type ThemePreference = ThemeMode;
/** What that actually resolves to once the OS has been consulted. */
export type ThemeModeValue = "light" | "dark";

const STORAGE_KEY = "ssw-theme-mode";
const DARK_QUERY = "(prefers-color-scheme: dark)";

type ThemeModeContextValue = {
  /** The resolved mode — what the page is actually painting. */
  mode: ThemeModeValue;
  /** Whether that mode is currently being taken from the OS. */
  isFollowingSystem: boolean;
  toggle: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

function readStoredPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // Private browsing or blocked storage — fall back to the OS.
  }
  return "system";
}

/**
 * The OS preference leads: the theme is whatever the system says until the
 * visitor explicitly asks for the opposite, and it keeps tracking the system
 * live while no override is set.
 *
 * Astryx's own `Theme` understands "system" directly — it drops `data-theme`
 * from the root so the stylesheet's `light-dark()` tokens resolve off
 * `prefers-color-scheme` — so the preference is handed straight to it rather
 * than being resolved here first.
 */
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  // Both start at the server-rendered values so hydration matches; the effect
  // below reconciles them with the real OS and storage immediately after.
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [systemMode, setSystemMode] = useState<ThemeModeValue>("dark");

  useLayoutEffect(() => {
    const query = window.matchMedia(DARK_QUERY);

    // One-time hydration of persisted + OS state, not a render loop.
    /* eslint-disable react-hooks/set-state-in-effect */
    setSystemMode(query.matches ? "dark" : "light");
    setPreference(readStoredPreference());
    /* eslint-enable react-hooks/set-state-in-effect */

    const onSystemChange = (event: MediaQueryListEvent) =>
      setSystemMode(event.matches ? "dark" : "light");

    query.addEventListener("change", onSystemChange);
    return () => query.removeEventListener("change", onSystemChange);
  }, []);

  const mode: ThemeModeValue =
    preference === "system" ? systemMode : preference;

  const toggle = useCallback(() => {
    const next: ThemeModeValue = mode === "dark" ? "light" : "dark";
    // Landing back on what the OS already reports resumes following it, so
    // toggling twice never strands the visitor on a permanent override.
    const nextPreference: ThemePreference =
      next === systemMode ? "system" : next;

    setPreference(nextPreference);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextPreference);
    } catch {
      // Preference just will not survive the session; not worth failing over.
    }
  }, [mode, systemMode]);

  const value = useMemo(
    () => ({
      mode,
      isFollowingSystem: preference === "system",
      toggle,
    }),
    [mode, preference, toggle],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <Theme theme={sswTheme} mode={preference}>
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
