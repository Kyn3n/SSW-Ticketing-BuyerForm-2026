import { Stack, Text } from "@astryxdesign/core";
import type { ReactNode } from "react";

type AccentNoteProps = {
  title?: ReactNode;
  children: ReactNode;
  tone?: "muted" | "accent";
  ariaLive?: "polite" | "off";
};

/**
 * A note hanging off a gold rule — used for guidance and savings hints, the
 * same treatment the printed ticket collateral uses.
 */
export function AccentNote({
  title,
  children,
  tone = "muted",
  ariaLive = "off",
}: AccentNoteProps) {
  return (
    <Stack
      direction="vertical"
      gap={0.5}
      className="ssw-accent-note"
      aria-live={ariaLive === "off" ? undefined : ariaLive}
    >
      {title && (
        <Text type="body" weight="semibold">
          {title}
        </Text>
      )}
      <Text type="supporting" color={tone === "accent" ? "accent" : "secondary"}>
        {children}
      </Text>
    </Stack>
  );
}
