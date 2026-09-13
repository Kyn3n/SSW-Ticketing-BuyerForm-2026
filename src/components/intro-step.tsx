import { Card, Grid, Stack, Text } from "@astryxdesign/core";
import { formatMyr } from "@/data/mappers/helper";
import { TICKET_TYPES } from "@/types/ticket";
import { AccentNote } from "./accent-note";
import { Eyebrow } from "./eyebrow";

const EVENT_FACTS = [
  { label: "Date", value: "17 October 2026" },
  { label: "Doors open", value: "6:30 PM" },
  { label: "Venue", value: "The Foundry Hall" },
  { label: "City", value: "Kuala Lumpur" },
];

const GUIDE = [
  "Pick your tiers and quantities — bundles give you a fourth ticket free.",
  "Tell us who the tickets are for so we know where to send them.",
  "Transfer the total, then upload the receipt from your banking app.",
  "We verify the payment by hand and email your tickets once it clears.",
];

/** Step 1: what the night is, where it is, and how this form works. */
export function IntroStep() {
  return (
    <Stack direction="vertical" gap={6}>
      <Card variant="muted" padding={5}>
        <Stack direction="vertical" gap={2}>
          <Text type="large" weight="semibold">
            Welcome, and thank you for coming.
          </Text>
          <Text type="body" color="secondary">
            Summer Soundwave is a single-room, single-night show. There is no
            allocated seating and no resale — every ticket is issued by hand to
            the name on this form, which is why the four steps ahead ask for a
            little more than a checkout usually would.
          </Text>
        </Stack>
      </Card>

      <Stack direction="vertical" gap={4}>
        <Eyebrow>The details</Eyebrow>
        <Grid columns={{ minWidth: 180, max: 2 }} gap={4}>
          {EVENT_FACTS.map((fact) => (
            <Stack key={fact.label} direction="vertical" gap={0.5}>
              <Text type="supporting" className="ssw-eyebrow">
                {fact.label}
              </Text>
              <Text type="body" weight="semibold">
                {fact.value}
              </Text>
            </Stack>
          ))}
        </Grid>
      </Stack>

      <Stack direction="vertical" gap={4}>
        <Eyebrow>How this works</Eyebrow>
        <Stack direction="vertical" gap={3} as="ol" padding={0}>
          {GUIDE.map((line, index) => (
            <Stack key={line} direction="horizontal" gap={3} vAlign="start" as="li">
              <span className="ssw-guide-number" aria-hidden="true">
                {index + 1}
              </span>
              <Text type="body" color="secondary">
                {line}
              </Text>
            </Stack>
          ))}
        </Stack>
      </Stack>

      <AccentNote title="Pricing at a glance">
        Normal {formatMyr(TICKET_TYPES.normal.price)} &middot; VIP{" "}
        {formatMyr(TICKET_TYPES.vip.price)} per paid ticket. Any bundle is four
        tickets for the price of three.
      </AccentNote>
    </Stack>
  );
}
