"use client";

import { Stack, Text } from "@astryxdesign/core";
import { ThemeModeToggle } from "./theme-mode-toggle";

/**
 * Brand row that sits over the hero photo: mark, wordmark, and the mode
 * toggle in place of the old static "secure order form" caption.
 */
export function BrandHeader() {
  return (
    <Stack
      as="header"
      direction="horizontal"
      justify="between"
      vAlign="center"
      wrap="wrap"
      gap={3}
      width="100%"
      maxWidth={1024}
      className="ssw-hero-overlay"
    >
      <Stack direction="horizontal" vAlign="center" gap={3}>
        <span className="ssw-brandmark" aria-hidden="true">
          SSW
        </span>
        <Stack direction="vertical" gap={0}>
          <Text type="body" weight="semibold" color="inherit">
            Summer Soundwave
          </Text>
          <Text type="supporting" color="inherit" style={{ opacity: 0.65 }}>
            Official ticketing
          </Text>
        </Stack>
      </Stack>

      <Stack direction="horizontal" vAlign="center" gap={4} wrap="wrap">
        <Text
          type="supporting"
          color="inherit"
          className="ssw-eyebrow"
          style={{ opacity: 0.6 }}
        >
          Secure order form
        </Text>
        <ThemeModeToggle />
      </Stack>
    </Stack>
  );
}
