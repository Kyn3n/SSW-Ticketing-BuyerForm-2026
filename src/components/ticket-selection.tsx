import { Divider, Stack, Text } from "@astryxdesign/core";
import { formatMyr, pluralizeTickets } from "@/data/mappers/helper";
import {
  TICKET_TYPE_KEYS,
  type SavingsOpportunity,
  type TicketCounts,
  type TicketLine,
  type TicketType,
} from "@/types/ticket";
import { AccentNote } from "./accent-note";
import { TicketTypeRow } from "./ticket-type-row";

type TicketSelectionProps = {
  ticketLines: Record<TicketType, TicketLine>;
  savingsOpportunities: Record<TicketType, SavingsOpportunity>;
  seatCount: number;
  total: number;
  isDisabled: boolean;
  onCountChange: (
    type: TicketType,
    field: keyof TicketCounts,
    value: number,
  ) => void;
};

/** The whole ticket fieldset: guidance, one row per tier, and the running total. */
export function TicketSelection({
  ticketLines,
  savingsOpportunities,
  seatCount,
  total,
  isDisabled,
  onCountChange,
}: TicketSelectionProps) {
  return (
    <Stack as="fieldset" direction="vertical" gap={6} padding={0}>
      <Stack direction="vertical" gap={4}>
        <Stack direction="vertical" gap={0.5}>
          <Text type="label">Ticket selection</Text>
          <Text type="supporting">Mix Normal and VIP tickets in one order.</Text>
        </Stack>

        <AccentNote>
          Choose singles for an exact quantity, or add bundles to save the price
          of one ticket for every 4 tickets.
        </AccentNote>
      </Stack>

      <Stack direction="vertical" gap={6}>
        {TICKET_TYPE_KEYS.map((type, index) => (
          <Stack key={type} direction="vertical" gap={6}>
            {index > 0 && <Divider />}
            <TicketTypeRow
              type={type}
              line={ticketLines[type]}
              savings={savingsOpportunities[type]}
              isDisabled={isDisabled}
              canRemoveLastSeat={seatCount > 1}
              onCountChange={(field, value) => onCountChange(type, field, value)}
            />
          </Stack>
        ))}
      </Stack>

      <Divider />

      <Stack direction="horizontal" justify="between" vAlign="center" gap={4}>
        <Text type="supporting">
          {seatCount} {pluralizeTickets(seatCount)} total
        </Text>
        <Text type="large" weight="bold" hasTabularNumbers aria-live="polite">
          {formatMyr(total)}
        </Text>
      </Stack>
    </Stack>
  );
}
