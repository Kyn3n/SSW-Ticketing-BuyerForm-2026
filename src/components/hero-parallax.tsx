"use client";

import { useEffect, useState } from "react";

export const HERO_HEIGHT = 500;
/** How far the sheet of forms rides up over the bottom of the photo. */
export const HERO_OVERLAP = 70;

/** Served from `public/`, so it ships with every build automatically. */
const HERO_IMAGE =
  'image-set(url("/ssw-banner.webp") type("image/webp"), url("/ssw-banner.png") type("image/png"))';
const MOBILE_HERO_IMAGE =
  'image-set(url("/ssw-banner-mobile.webp") type("image/webp"), url("/ssw-banner-mobile.png") type("image/png"))';

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
        ["--ssw-hero-image" as string]: HERO_IMAGE,
        ["--ssw-hero-mobile-image" as string]: MOBILE_HERO_IMAGE,
      }}
    >
      <div className="ssw-hero__media" aria-hidden="true" />
      <div className="ssw-hero__beams" aria-hidden="true" />
      <div className="ssw-hero__scrim" aria-hidden="true" />
      <div className="ssw-hero__dissolve" aria-hidden="true" />

    </div>
  );
}
