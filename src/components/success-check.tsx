"use client";

import { motion, useReducedMotion } from "motion/react";

const SIZE = 88;
const CENTER = SIZE / 2;
const RING_RADIUS = 36;

/** Settles quickly without snapping — reads as "done", not "loading". */
const SETTLE = [0.22, 1, 0.36, 1] as const;

/**
 * The completion mark: a ring draws itself clockwise, the tick strokes in
 * behind it, and a single halo pulses outwards and clears. Everything is
 * driven by Motion rather than CSS keyframes so the timings stay in one
 * place alongside the rest of the success panel's entrance.
 */
export function SuccessCheck() {
  const shouldReduceMotion = useReducedMotion();

  // Reduced motion still gets the mark, just fully formed and static.
  const draw = shouldReduceMotion
    ? { initial: { pathLength: 1 }, animate: { pathLength: 1 } }
    : { initial: { pathLength: 0 }, animate: { pathLength: 1 } };

  return (
    <motion.svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      fill="none"
      role="img"
      aria-label="Order recorded"
      initial={shouldReduceMotion ? false : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.45, ease: SETTLE }}
    >
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RING_RADIUS}
        fill="var(--color-success-muted)"
      />

      {/* Expanding halo — one pass, then it is gone. */}
      {!shouldReduceMotion && (
        <motion.circle
          cx={CENTER}
          cy={CENTER}
          r={RING_RADIUS}
          stroke="var(--color-success)"
          strokeWidth={2}
          style={{ transformOrigin: "center", transformBox: "fill-box" }}
          initial={{ scale: 1, opacity: 0.55 }}
          animate={{ scale: 1.3, opacity: 0 }}
          transition={{ duration: 0.9, delay: 0.55, ease: "easeOut" }}
        />
      )}

      {/* The ring draws from 12 o'clock, hence the -90° rotation. */}
      <motion.circle
        cx={CENTER}
        cy={CENTER}
        r={RING_RADIUS}
        stroke="var(--color-success)"
        strokeWidth={3}
        strokeLinecap="round"
        style={{ rotate: -90, transformOrigin: "center", transformBox: "fill-box" }}
        initial={draw.initial}
        animate={draw.animate}
        transition={{ duration: 0.65, ease: SETTLE }}
      />

      <motion.path
        d="M29 45.5 L39.5 56 L60 32"
        stroke="var(--color-success)"
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={draw.initial}
        animate={draw.animate}
        transition={{ duration: 0.35, delay: 0.42, ease: "easeOut" }}
      />
    </motion.svg>
  );
}
