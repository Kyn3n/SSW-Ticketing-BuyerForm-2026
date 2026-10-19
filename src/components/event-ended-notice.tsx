import { Stack, Text } from "@astryxdesign/core";
import { CalendarCheck } from "lucide-react";
import { Eyebrow } from "./eyebrow";

export function EventEndedNotice() {
  return (
    <Stack
      direction="vertical"
      gap={5}
      hAlign="center"
      padding={4}
      className="ssw-sold-out-panel"
    >
      <Stack
        hAlign="center"
        vAlign="center"
        className="ssw-sold-out-panel__icon"
      >
        <CalendarCheck size={32} strokeWidth={1.5} aria-hidden="true" />
      </Stack>

      <Stack direction="vertical" gap={1} hAlign="center">
        <Eyebrow>Odyssey</Eyebrow>
        <Text type="display-3" as="h2" justify="center">
          This event has concluded
        </Text>
      </Stack>

      <Text
        type="body"
        color="secondary"
        justify="center"
        className="ssw-sold-out-panel__lede"
      >
        Thank you to everyone who joined and supported Selangor Symphonic
        Winds. Ticket orders are now closed. For any post-event questions,
        please use the contact details provided.
      </Text>
    </Stack>
  );
}
