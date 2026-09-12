"use client";

import { useEffect, type RefObject } from "react";

/**
 * The sheet covers its travel over 2.2x that much scrolling, so it drifts up
 * at roughly half scroll speed instead of sliding past at 1:1. Kept in step
 * with --ssw-handoff-extra in globals.css, which reserves the scroll the
 * sheet gives back by holding itself down.
 */
const HANDOFF_SLOWDOWN = 2.2;

/** The photo finishes dissolving a little before the sheet comes to rest. */
const DISSOLVE_FRACTION = 0.85;

type HandoffElements = {
  /** `.ssw-page` — the root the custom properties are published on. */
  pageRef: RefObject<HTMLElement | null>;
  /** `.ssw-hero` — measured for the height the sheet has to climb. */
  heroRef: RefObject<HTMLElement | null>;
  /** `.ssw-sheet` — the surface that is held back against the scroll. */
  sheetRef: RefObject<HTMLElement | null>;
  /** `.ssw-folder` — the panel that has to end up centred on screen. */
  panelRef: RefObject<HTMLElement | null>;
};

type Geometry = {
  /** How far the sheet climbs between its start and its resting place. */
  travel: number;
  /** How much scrolling it is given to do that in. */
  runway: number;
};

function readPx(styles: CSSStyleDeclaration, property: string) {
  const value = Number.parseFloat(styles.getPropertyValue(property));

  return Number.isFinite(value) ? value : 0;
}

/**
 * Drives the one scroll-linked hand-off on the page: the photo dissolves while
 * the sheet of forms is held back against the scroll, climbing at about half
 * speed until the panel is centred on screen — at which point the photo is
 * gone and the page has run out of scroll, so the climb simply stops there.
 *
 * Nothing here is a timed animation. Everything is read straight off the
 * scroll position and published as custom properties on `.ssw-page`, so the
 * look lives in `globals.css` and scrolling faster just resolves it faster.
 */
export function useScrollHandoff({
  pageRef,
  heroRef,
  sheetRef,
  panelRef,
}: HandoffElements) {
  useEffect(() => {
    const page = pageRef.current;
    const hero = heroRef.current;
    const sheet = sheetRef.current;
    const panel = panelRef.current;
    if (!page || !hero || !sheet || !panel) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let geometry: Geometry = { travel: 1, runway: 1 };
    let frame = 0;

    const measure = () => {
      // Where the sheet's top edge starts out: one overlap short of the bottom
      // of the photo, so the forms begin by covering its lower edge.
      const startsAt =
        hero.offsetHeight -
        readPx(getComputedStyle(hero), "--ssw-hero-overlap");

      // Where it comes to a stop: far enough up that the panel is centred in
      // the viewport. A panel taller than the screen cannot be centred, so
      // that one rests flush with the top instead.
      const padTop = readPx(getComputedStyle(sheet), "padding-top");
      const restsAt = Math.max(
        0,
        (window.innerHeight - panel.offsetHeight) / 2 - padTop,
      );

      // The sheet is sized off this, so the page runs out of scroll exactly as
      // the panel lands — that is what stops it in the middle of the screen
      // rather than letting it sail on up to the top.
      page.style.setProperty("--ssw-sheet-rest", `${restsAt.toFixed(2)}px`);

      const travel = Math.max(1, startsAt - restsAt);
      geometry = { travel, runway: travel * HANDOFF_SLOWDOWN };
    };

    const paint = () => {
      frame = 0;
      const { travel, runway } = geometry;
      const scrolled = Math.max(0, window.scrollY);

      // Hold the sheet back by the share of the scroll it is not allowed to
      // spend, up to the surplus it gives back. Past that it is at rest, and
      // further scrolling moves it normally — which only happens when the
      // panel is too tall to fit on screen and still has more to read.
      const lag = Math.min(runway - travel, scrolled * (1 - travel / runway));
      page.style.setProperty("--sheet-lag", `${lag.toFixed(2)}px`);

      const progress = Math.min(1, scrolled / (runway * DISSOLVE_FRACTION));
      page.style.setProperty("--hero-p", progress.toFixed(4));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const remeasure = () => {
      measure();
      onScroll();
    };

    const observer = new ResizeObserver(remeasure);

    const attach = () => {
      if (motionQuery.matches) {
        page.style.setProperty("--hero-p", "0");
        page.style.setProperty("--sheet-lag", "0px");
        page.style.setProperty("--ssw-sheet-rest", "0px");
        return;
      }

      remeasure();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", remeasure);
      // Each step is a different height, so the resting place moves with it.
      observer.observe(panel);
    };

    const detach = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const onMotionChange = () => {
      detach();
      attach();
    };

    attach();
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      detach();
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, [pageRef, heroRef, sheetRef, panelRef]);
}
