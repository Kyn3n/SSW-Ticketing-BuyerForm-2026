import { Stack, Text } from "@astryxdesign/core";
import { TicketX } from "lucide-react";
import { Eyebrow } from "./eyebrow";

/**
 * Replaces the order form once every ticket type has sold out. The event
 * panel stays alongside it so the buyer still sees what they missed and how
 * to reach the PIC — there is just nothing left here to submit.
 */
export function SoldOutNotice() {
  return (
    <Stack direction="vertical" gap={5} hAlign="center" padding={4} className="ssw-sold-out-panel">
      <Stack hAlign="center" vAlign="center" className="ssw-sold-out-panel__icon">
        <TicketX size={32} strokeWidth={1.5} aria-hidden="true" />
      </Stack>

      <Stack direction="vertical" gap={1} hAlign="center">
        <Eyebrow>Ticket order</Eyebrow>
        <Text type="display-3" as="h2" justify="center">
          Tickets are sold out
        </Text>
      </Stack>

      <Text
        type="body"
        color="secondary"
        justify="center"
        className="ssw-sold-out-panel__lede"
      >
        Every seat has been claimed. Thank you for your interest and support —
        we hope to see you at the next Selangor Symphonic Winds concert. If
        you have any questions, reach out using the contact details above.
      </Text>
    </Stack>
  );
}
