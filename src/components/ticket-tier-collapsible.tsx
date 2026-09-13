"use client";

import { Badge, Collapsible, Divider, Stack, Text } from "@astryxdesign/core";
import { formatMyr, pluralizeBundles, pluralizeTickets } from "@/data/mappers/helper";
import {
  BUNDLE_PAID_SEATS,
  BUNDLE_SIZE,
  TICKET_TYPES,
  type SavingsOpportunity,
  type TicketCounts,
  type TicketLine,
  type TicketType,
} from "@/types/ticket";
import { AccentNote } from "./accent-note";
import { QuantityField } from "./quantity-field";

type TicketTierCollapsibleProps = {
  type: TicketType;
  line: TicketLine;
  savings: SavingsOpportunity;
  isOpen: boolean;
  isDisabled: boolean;
  canRemoveLastSeat: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCountChange: (field: keyof TicketCounts, value: number) => void;
};

/**
 * One tier as an expand/collapse row. Collapsed, the trigger still shows what
 * has been picked, so the buyer can close both tiers and still see the basket.
 */
export function TicketTierCollapsible({
  type,
  line,
  savings,
  isOpen,
  isDisabled,
  canRemoveLastSeat,
  onOpenChange,
  onCountChange,
}: TicketTierCollapsibleProps) {
  const ticket = TICKET_TYPES[type];
  const bundlePrice = ticket.price * BUNDLE_PAID_SEATS;

  const trigger = (
    <Stack
      direction="horizontal"
      justify="between"
      vAlign="center"
      wrap="wrap"
      gap={3}
      width="100%"
    >
      <Stack direction="vertical" gap={0.5}>
        <Text type="large" weight="semibold">
          {ticket.label}
        </Text>
        <Text type="supporting">
          {formatMyr(ticket.price)} each &middot; {BUNDLE_SIZE} for{" "}
          {formatMyr(bundlePrice)}
        </Text>
      </Stack>

      <Stack direction="horizontal" vAlign="center" gap={3}>
        {line.seatCount > 0 && (
          <Badge
            variant="info"
            label={`${line.seatCount} ${pluralizeTickets(line.seatCount)}`}
          />
        )}
        <Text type="large" weight="semibold" color="accent" hasTabularNumbers>
          {formatMyr(line.subtotal)}
        </Text>
      </Stack>
    </Stack>
  );

  return (
    <div className="ssw-tier" data-open={isOpen || undefined}>
      <Collapsible trigger={trigger} isOpen={isOpen} onOpenChange={onOpenChange}>
        <Stack direction="vertical" gap={5} paddingBlockStart={4}>
          <Divider />

          <QuantityField
            label={`${ticket.label} singles`}
            description={`${formatMyr(ticket.price)} each`}
            value={line.singleCount}
            min={canRemoveLastSeat ? 0 : line.singleCount}
            isDisabled={isDisabled}
            onChange={(value) => onCountChange("singleCount", value)}
          />

          <QuantityField
            label={`${ticket.label} bundle`}
            description={`${BUNDLE_SIZE} tickets for ${formatMyr(bundlePrice)} — save ${formatMyr(ticket.price)}`}
            value={line.bundleCount}
            min={canRemoveLastSeat ? 0 : line.bundleCount}
            isDisabled={isDisabled}
            onChange={(value) => onCountChange("bundleCount", value)}
          />

          {savings.bundleCount > 0 && (
            <AccentNote tone="accent" ariaLive="polite">
              Switch {savings.singlesConverted} singles to {savings.bundleCount}{" "}
              {pluralizeBundles(savings.bundleCount)} and save{" "}
              {formatMyr(savings.savings)}.
            </AccentNote>
          )}

          <Text type="supporting" justify="end" display="block">
            {line.seatCount} {pluralizeTickets(line.seatCount)} in this tier
          </Text>
        </Stack>
      </Collapsible>
    </div>
  );
}
