import { Stack, StatusDot, Text } from "@astryxdesign/core";
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

/** Below this many remaining seats, nudge the buyer that the tier is nearly gone. */
const LOW_STOCK_THRESHOLD = 10;

type TicketTypeRowProps = {
  type: TicketType;
  line: TicketLine;
  savings: SavingsOpportunity;
  pricing: { singlePrice: number; bundlePrice: number };
  /** Seats left for this ticket type, shared by its single and bundle SKUs. */
  remainingSeats: number;
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
  remainingSeats,
  isDisabled,
  canRemoveLastSeat,
  onCountChange,
}: TicketTypeRowProps) {
  const ticket = TICKET_TYPES[type];
  const { singlePrice, bundlePrice } = pricing;
  const bundleSavings = BUNDLE_SIZE * singlePrice - bundlePrice;

  const isSoldOut = remainingSeats <= 0;
  const isLowStock = !isSoldOut && remainingSeats <= LOW_STOCK_THRESHOLD;
  const maxSingleCount = isSoldOut
    ? 0
    : Math.max(0, remainingSeats - line.bundleCount * BUNDLE_SIZE);
  const maxBundleCount = isSoldOut
    ? 0
    : Math.floor(Math.max(0, remainingSeats - line.singleCount) / BUNDLE_SIZE);

  return (
    <Stack direction="vertical" gap={5}>
      <Stack direction="horizontal" justify="between" vAlign="start" gap={4}>
        <Stack direction="vertical" gap={0.5}>
          <Text type="large" weight="semibold">
            {ticket.label}
          </Text>
          <Text type="supporting">{formatMyr(singlePrice)} per paid ticket</Text>
          {isSoldOut && (
            <Stack direction="horizontal" gap={1.5} vAlign="center">
              <StatusDot variant="error" label="Sold out" />
              <Text type="supporting">Sold out</Text>
            </Stack>
          )}
          {isLowStock && (
            <Stack direction="horizontal" gap={1.5} vAlign="center">
              <StatusDot variant="warning" label="Low availability" />
              <Text type="supporting">
                Only {remainingSeats} {pluralizeTickets(remainingSeats)} left
              </Text>
            </Stack>
          )}
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
          max={maxSingleCount}
          isDisabled={isDisabled || isSoldOut}
          disabledMessage={isSoldOut ? "Sold out" : undefined}
          onChange={(value) => onCountChange("singleCount", value)}
        />
        <QuantityField
          label={`${ticket.label} bundle`}
          description={`${BUNDLE_SIZE} tickets for ${formatMyr(bundlePrice)} (save ${formatMyr(bundleSavings)})`}
          value={line.bundleCount}
          min={canRemoveLastSeat ? 0 : line.bundleCount}
          max={maxBundleCount}
          isDisabled={isDisabled || isSoldOut}
          disabledMessage={isSoldOut ? "Sold out" : undefined}
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
