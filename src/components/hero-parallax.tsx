"use client";

import { useEffect, useState } from "react";
import { Stack, Text } from "@astryxdesign/core";

export const HERO_HEIGHT = 520;
/** How far the sheet of forms rides up over the bottom of the photo. */
export const HERO_OVERLAP = 120;

/**
 * Placeholder artwork so the scroll effect is visible before the real event
 * photo exists. Swap this one constant for the final asset (or a local
 * `/hero.jpg`) and nothing else needs to change.
 */
const HERO_PLACEHOLDER_IMAGE =
  'url("https://picsum.photos/seed/summer-soundwave/1800/1000")';

/**
 * The image finishes dissolving slightly before the sheet of forms has fully
 * covered it, so the hand-off reads as one motion rather than a cut.
 */
const DISSOLVE_RUNWAY = (HERO_HEIGHT - HERO_OVERLAP) * 0.85;

/**
 * A fixed hero photo the page scrolls over. As you scroll it drifts slower
 * than the page, spreads outwards, and dissolves into the page background —
 * by the time the forms reach it, the image has already given way to them.
 *
 * The scroll position is published as a single CSS custom property so the
 * whole effect is expressed in `globals.css` and no React state is touched
 * per frame. It lands on the document root rather than the hero element
 * because the scrolling sheet has to read it too — it fades its own border
 * and shadow out as the photo goes, so its rounded corners end up blending
 * into a page background that now matches on both sides of the curve.
 */
export function HeroParallax() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Reading the media query once on mount, not a render loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefersReducedMotion(motionQuery.matches);

    const onMotionChange = (event: MediaQueryListEvent) =>
      setPrefersReducedMotion(event.matches);
    motionQuery.addEventListener("change", onMotionChange);

    return () => motionQuery.removeEventListener("change", onMotionChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (prefersReducedMotion) {
      root.style.setProperty("--hero-p", "0");
      return;
    }

    let frame = 0;

    function update() {
      frame = 0;
      const progress = Math.min(1, Math.max(0, window.scrollY / DISSOLVE_RUNWAY));
      root.style.setProperty("--hero-p", progress.toFixed(4));
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      root.style.removeProperty("--hero-p");
    };
  }, [prefersReducedMotion]);

  return (
    <div
      className="ssw-hero"
      style={{
        ["--ssw-hero-height" as string]: `${HERO_HEIGHT}px`,
        ["--ssw-hero-image" as string]: HERO_PLACEHOLDER_IMAGE,
      }}
    >
      <div className="ssw-hero__media" aria-hidden="true" />
      <div className="ssw-hero__beams" aria-hidden="true" />
      <div className="ssw-hero__scrim" aria-hidden="true" />
      <div className="ssw-hero__dissolve" aria-hidden="true" />

      <Stack
        direction="vertical"
        hAlign="center"
        vAlign="center"
        gap={3}
        height="100%"
        paddingInline={5}
        className="ssw-hero__copy ssw-hero-overlay"
      >
        <Text type="supporting" color="inherit" className="ssw-eyebrow">
          17 October 2026 &middot; Kuala Lumpur
        </Text>
        <Text type="display-1" color="inherit" justify="center">
          Summer Soundwave
        </Text>
        <Text type="body" color="inherit" justify="center" style={{ opacity: 0.7 }}>
          Placeholder artwork — scroll to hand over to the order form.
        </Text>
      </Stack>
    </div>
  );
}
