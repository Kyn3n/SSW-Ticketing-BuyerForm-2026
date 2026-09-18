"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { IconButton } from "@astryxdesign/core";
import { useThemeMode } from "@/providers/theme-mode-provider";

/**
 * Filled rather than outlined, and coloured rather than inheriting: the
 * toggle sits on the hero photo in both modes, so it carries its own contrast
 * instead of borrowing the header's.
 */
const SUN_COLOR = "#f2a93b";
const MOON_COLOR = "#cdd9f2";

const SWAP = { duration: 0.32, ease: [0.22, 1, 0.36, 1] } as const;

/**
 * Sun and moon trade places on a quarter turn — the outgoing glyph keeps
 * rotating the way the incoming one arrives, so the swap reads as one dial
 * turning rather than two icons crossfading.
 */
export function ThemeModeToggle() {
  const { mode, isFollowingSystem, toggle } = useThemeMode();
  const shouldReduceMotion = useReducedMotion();

  const isDark = mode === "dark";
  const target = isDark ? "light" : "dark";

  return (
    <IconButton
      label={
        isFollowingSystem
          ? `Switch to ${target} mode (following your system)`
          : `Switch to ${target} mode`
      }
      variant="secondary"
      size="sm"
      onClick={toggle}
      icon={
        <span className="ssw-mode-toggle">
          <AnimatePresence initial={false}>
            <motion.span
              // Keying on the mode is what makes the swap an enter/exit pair.
              // The outgoing glyph keeps the colour it rendered with, since
              // AnimatePresence holds on to the element it already made.
              key={mode}
              className="ssw-mode-toggle__glyph"
              style={{ color: isDark ? MOON_COLOR : SUN_COLOR }}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { rotate: -90, scale: 0.4, opacity: 0 }
              }
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { rotate: 90, scale: 0.4, opacity: 0 }
              }
              transition={SWAP}
            >
              {isDark ? (
                <Moon
                  size={18}
                  strokeWidth={1.5}
                  fill="currentColor"
                  aria-hidden="true"
                />
              ) : (
                <Sun
                  size={18}
                  strokeWidth={1.5}
                  fill="currentColor"
                  aria-hidden="true"
                />
              )}
            </motion.span>
          </AnimatePresence>
        </span>
      }
    />
  );
}
