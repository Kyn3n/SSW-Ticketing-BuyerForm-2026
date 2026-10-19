"use client";

import { Card, Stack } from "@astryxdesign/core";
import { BrandHeader } from "./brand-header";
import { EventEndedNotice } from "./event-ended-notice";
import { EventPanel } from "./event-panel";
import { HeroParallax, HERO_HEIGHT, HERO_OVERLAP } from "./hero-parallax";

const PANEL_MAX_WIDTH = 1024;

export function EventEndedPage() {
  return (
    <main className="ssw-page">
      <HeroParallax />

      <div className="ssw-scroller">
        <Stack
          direction="vertical"
          hAlign="center"
          justify="start"
          paddingInline={5}
          paddingBlock={6}
          style={{ minHeight: HERO_HEIGHT - HERO_OVERLAP }}
        />

        <div className="ssw-sheet">
          <Stack direction="vertical" hAlign="center">
            <div className="ssw-sheet__header">
              <BrandHeader caption="Event archive" />
            </div>

            <Card
              padding={0}
              width="100%"
              maxWidth={PANEL_MAX_WIDTH}
              elevation="high"
              style={{ overflow: "hidden" }}
            >
              <div className="ssw-panel-grid">
                <EventPanel showOrderingInfo={false} />

                <Stack direction="vertical" gap={6} padding={8} as="section">
                  <EventEndedNotice />
                </Stack>
              </div>
            </Card>
          </Stack>
        </div>
      </div>
    </main>
  );
}
