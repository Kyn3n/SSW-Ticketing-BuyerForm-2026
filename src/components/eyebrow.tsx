import { Text } from "@astryxdesign/core";
import type { ReactNode } from "react";

/**
 * The small uppercase gold kicker that sits above every heading in this form.
 * A plain Astryx `Text` with the tracking the brand uses.
 */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <Text
      type="supporting"
      color="accent"
      weight="semibold"
      display="block"
      className="ssw-eyebrow"
    >
      {children}
    </Text>
  );
}
