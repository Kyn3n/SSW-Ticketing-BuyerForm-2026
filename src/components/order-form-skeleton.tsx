import { Divider, Skeleton, Stack, VisuallyHidden } from "@astryxdesign/core";

const TICKET_TIER_INDEXES = [0, 1];

/** One quantity-field-shaped placeholder: label/description left, stepper right. */
function QuantityFieldSkeleton({ index }: { index: number }) {
  return (
    <Stack direction="horizontal" justify="between" vAlign="center" gap={3}>
      <Skeleton width="55%" height={14} index={index} />
      <Skeleton width={132} height={36} index={index} />
    </Stack>
  );
}

/** One ticket-tier-shaped block: title/price, subtotal, and its two quantity rows. */
function TicketTierSkeleton({ index }: { index: number }) {
  const base = index * 3;
  return (
    <Stack direction="vertical" gap={5}>
      <Stack direction="horizontal" justify="between" vAlign="start" gap={4}>
        <Stack direction="vertical" gap={2}>
          <Skeleton width={96} height={20} index={base} />
          <Skeleton width={140} height={14} index={base} />
        </Stack>
        <Skeleton width={80} height={20} index={base} />
      </Stack>
      <Stack direction="vertical" gap={4}>
        <QuantityFieldSkeleton index={base + 1} />
        <QuantityFieldSkeleton index={base + 2} />
      </Stack>
    </Stack>
  );
}

/**
 * Stands in for the whole order form while ticket prices and seat
 * availability are still loading, so the buyer never sees fields they can't
 * trust yet — or a sold-out state that hasn't actually been confirmed.
 */
export function OrderFormSkeleton() {
  return (
    <Stack
      direction="vertical"
      gap={6}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <VisuallyHidden>Loading ticket availability…</VisuallyHidden>

      <Stack direction="vertical" gap={1} aria-hidden="true">
        <Skeleton width={100} height={12} index={0} />
        <Skeleton width={180} height={28} index={0} />
      </Stack>

      <Stack direction="vertical" gap={6} aria-hidden="true">
        {TICKET_TIER_INDEXES.map((index) => (
          <Stack key={index} direction="vertical" gap={6}>
            {index > 0 && <Divider />}
            <TicketTierSkeleton index={index} />
          </Stack>
        ))}

        <Divider />

        <Stack direction="horizontal" justify="between" vAlign="center" gap={4}>
          <Skeleton width={110} height={14} index={7} />
          <Skeleton width={90} height={24} index={7} />
        </Stack>
      </Stack>

      <Stack direction="vertical" gap={5} aria-hidden="true">
        <Skeleton height={64} index={8} />
        <Stack direction="horizontal" gap={5}>
          <Skeleton height={64} index={9} />
          <Skeleton height={64} index={9} />
        </Stack>
      </Stack>

      <Skeleton height={140} index={10} aria-hidden="true" />

      <Skeleton height={56} index={11} aria-hidden="true" />

      <Stack direction="vertical" gap={5} aria-hidden="true">
        <Divider />
        <Stack direction="horizontal" justify="between" vAlign="center" gap={4}>
          <Stack direction="vertical" gap={2}>
            <Skeleton width={90} height={12} index={12} />
            <Skeleton width={110} height={24} index={12} />
          </Stack>
          <Skeleton width={220} height={44} index={12} />
        </Stack>
      </Stack>
    </Stack>
  );
}
