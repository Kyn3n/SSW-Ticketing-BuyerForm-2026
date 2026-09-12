import type { Ref } from "react";
import { Stack, Text } from "@astryxdesign/core";

/**
 * Placeholder artwork so the scroll effect is visible before the real event
 * photo exists. Swap this one constant for the final asset (or a local
 * `/hero.jpg`) and nothing else needs to change.
 */
const HERO_PLACEHOLDER_IMAGE =
  'url("https://picsum.photos/seed/summer-soundwave/1800/1000")';

/**
 * The fixed hero photo the page scrolls over, and the event copy painted on
 * it. Every moving part is driven by the `--hero-p` custom property that
 * `useScrollHandoff` publishes on `.ssw-page`, so this component itself is
 * static — it only has to expose its element for measuring.
 */
export function HeroParallax({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className="ssw-hero"
      style={{ ["--ssw-hero-image" as string]: HERO_PLACEHOLDER_IMAGE }}
    >
      <div className="ssw-hero__media" aria-hidden="true" />
      <div className="ssw-hero__beams" aria-hidden="true" />
      <div className="ssw-hero__scrim" aria-hidden="true" />
      <div className="ssw-hero__dissolve" aria-hidden="true" />

      <Stack
        direction="vertical"
        hAlign="center"
        vAlign="center"
        gap={4}
        height="100%"
        maxWidth={720}
        paddingInline={5}
        className="ssw-hero__copy ssw-hero-overlay"
      >
        <Text type="supporting" color="inherit" className="ssw-eyebrow">
          17 October 2026 &middot; The Foundry Hall, Kuala Lumpur
        </Text>

        <Text type="display-1" color="inherit" justify="center" as="h1">
          Summer Soundwave 2026
        </Text>

        <Text
          type="body"
          color="inherit"
          justify="center"
          style={{ opacity: 0.78 }}
        >
          One room, one night, four acts and a sound system worth the trip. No
          allocated seating, no resale — every ticket is issued by hand to the
          name on the order.
        </Text>

        <blockquote className="ssw-hero__quote">
          <Text type="large" color="inherit" justify="center">
            &ldquo;The best room in the city for people who came to listen.&rdquo;
          </Text>
          <Text
            type="supporting"
            color="inherit"
            justify="center"
            className="ssw-eyebrow"
            style={{ opacity: 0.7 }}
          >
            The Wire, on last year&rsquo;s show
          </Text>
        </blockquote>
      </Stack>
    </div>
  );
}
