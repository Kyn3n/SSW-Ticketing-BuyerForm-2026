import { Divider, Stack, Text } from "@astryxdesign/core";
import { AccentNote } from "./accent-note";
import { Eyebrow } from "./eyebrow";

const EVENT_FACTS = [
  { label: "Date", value: "17 October 2026" },
  { label: "Venue", value: "The Foundry Hall, Kuala Lumpur" },
  { label: "Doors open", value: "6:30 PM" },
];

/** Left column of the order panel: what the buyer is actually paying for. */
export function EventPanel() {
  return (
    <Stack
      direction="vertical"
      gap={5}
      padding={8}
      className="ssw-panel-aside"
      as="aside"
    >
      <Eyebrow>Live event</Eyebrow>

      <Stack direction="vertical" gap={4}>
        <Text type="display-2" as="h1">
          Summer Soundwave 2026
        </Text>
        <Text type="supporting" color="secondary">
          An intimate evening of live music, crafted sound, and a room full of
          people who came to listen.
        </Text>
      </Stack>

      <Divider />

      <Stack direction="vertical" gap={4}>
        {EVENT_FACTS.map((fact) => (
          <Stack key={fact.label} direction="vertical" gap={0.5}>
            <Text type="supporting" className="ssw-eyebrow">
              {fact.label}
            </Text>
            <Text type="body">{fact.value}</Text>
          </Stack>
        ))}
      </Stack>

      <Divider />

      <AccentNote title="Manual verification">
        Tickets are issued by email after your receipt has been reviewed.
      </AccentNote>
    </Stack>
  );
}
