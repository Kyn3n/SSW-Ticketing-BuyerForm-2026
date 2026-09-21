import { Stack, Text } from "@astryxdesign/core";
import { formatMyr, pluralizeBundles, pluralizeTickets } from "@/data/mappers/helper";
import {
  BUNDLE_SIZE,
  TICKET_TYPES,
  type SavingsOpportunity,
  type TicketCounts,
  type TicketLine,
  type TicketType,
} from "@/types/ticket";
import { AccentNote } from "./accent-note";
import { QuantityField } from "./quantity-field";

type TicketTypeRowProps = {
  type: TicketType;
  line: TicketLine;
  savings: SavingsOpportunity;
  pricing: { singlePrice: number; bundlePrice: number };
  isDisabled: boolean;
  canRemoveLastSeat: boolean;
  onCountChange: (field: keyof TicketCounts, value: number) => void;
};

/** One tier (Normal or VIP): its price, its two counters, and its subtotal. */
export function TicketTypeRow({
  type,
  line,
  savings,
  pricing,
  isDisabled,
  canRemoveLastSeat,
  onCountChange,
}: TicketTypeRowProps) {
  const ticket = TICKET_TYPES[type];
  const { singlePrice, bundlePrice } = pricing;
  const bundleSavings = BUNDLE_SIZE * singlePrice - bundlePrice;

  return (
    <Stack direction="vertical" gap={5}>
      <Stack direction="horizontal" justify="between" vAlign="start" gap={4}>
        <Stack direction="vertical" gap={0.5}>
          <Text type="large" weight="semibold">
            {ticket.label}
          </Text>
          <Text type="supporting">{formatMyr(singlePrice)} per paid ticket</Text>
        </Stack>
        <Stack direction="vertical" gap={0.5} hAlign="end">
          <Text type="supporting" justify="end">
            Subtotal
          </Text>
          <Text type="large" weight="semibold" color="accent" hasTabularNumbers>
            {formatMyr(line.subtotal)}
          </Text>
        </Stack>
      </Stack>

      <Stack direction="vertical" gap={5}>
        <QuantityField
          label={`${ticket.label} singles`}
          description={`${formatMyr(singlePrice)} each`}
          value={line.singleCount}
          min={canRemoveLastSeat ? 0 : line.singleCount}
          isDisabled={isDisabled}
          onChange={(value) => onCountChange("singleCount", value)}
        />
        <QuantityField
          label={`${ticket.label} bundle`}
          description={`${BUNDLE_SIZE} tickets for ${formatMyr(bundlePrice)} (save ${formatMyr(bundleSavings)})`}
          value={line.bundleCount}
          min={canRemoveLastSeat ? 0 : line.bundleCount}
          isDisabled={isDisabled}
          onChange={(value) => onCountChange("bundleCount", value)}
        />
      </Stack>

      {savings.bundleCount > 0 && (
        <AccentNote tone="accent" ariaLive="polite">
          Switch {savings.singlesConverted} singles to {savings.bundleCount}{" "}
          {pluralizeBundles(savings.bundleCount)} and save{" "}
          {formatMyr(savings.savings)}.
        </AccentNote>
      )}

      <Text type="supporting" justify="end" display="block">
        {line.seatCount} {pluralizeTickets(line.seatCount)}
      </Text>
    </Stack>
  );
}
