"use client";

import { useState } from "react";
import { Banner, Divider, Stack, Text } from "@astryxdesign/core";
import {
  formatMyr,
  pluralizeTickets,
  TICKET_TYPE_KEYS,
  type SavingsOpportunity,
  type TicketCounts,
  type TicketLine,
  type TicketType,
} from "@/lib/tickets";
import { AccentNote } from "./accent-note";
import { TicketTierCollapsible } from "./ticket-tier-collapsible";

type SeatsStepProps = {
  ticketLines: Record<TicketType, TicketLine>;
  savingsOpportunities: Record<TicketType, SavingsOpportunity>;
  seatCount: number;
  total: number;
  error: string | null;
  isDisabled: boolean;
  onCountChange: (
    type: TicketType,
    field: keyof TicketCounts,
    value: number,
  ) => void;
};

/** Step 2: both tiers can be expanded at the same time, on initialize should open the normal tier only*/
export function SeatsStep({
  ticketLines,
  savingsOpportunities,
  seatCount,
  total,
  error,
  isDisabled,
  onCountChange,
}: SeatsStepProps) {
  // Both tiers can be expanded at the same time. Initialize with normal tier open.
  const [openTiers, setOpenTiers] = useState<Set<TicketType>>(() => {
    const initial = new Set<TicketType>(["normal"]);
    if (ticketLines.vip.seatCount > 0 && ticketLines.normal.seatCount === 0) {
      initial.clear();
      initial.add("vip");
    }
    return initial;
  });

  return (
    <Stack direction="vertical" gap={5}>
      <AccentNote>
        Choose singles for an exact quantity, or add bundles to save the price
        of one ticket for every four.
      </AccentNote>

      <Stack direction="vertical" gap={3}>
        {TICKET_TYPE_KEYS.map((type) => (
          <TicketTierCollapsible
            key={type}
            type={type}
            line={ticketLines[type]}
            savings={savingsOpportunities[type]}
            isOpen={openTiers.has(type)}
            isDisabled={isDisabled}
            canRemoveLastSeat={seatCount > 1}
            onOpenChange={() => {
              const newOpenTiers = new Set(openTiers);
              if (newOpenTiers.has(type)) {
                newOpenTiers.delete(type);
              } else {
                newOpenTiers.add(type);
              }
              setOpenTiers(newOpenTiers);
            }}
            onCountChange={(field, value) => onCountChange(type, field, value)}
          />
        ))}
      </Stack>

      {error && <Banner status="error" title="No tickets selected" description={error} />}

      <Divider />

      <Stack direction="horizontal" justify="between" vAlign="center" gap={4}>
        <Text type="supporting">
          {seatCount} {pluralizeTickets(seatCount)} total
        </Text>
        <Text type="display-3" hasTabularNumbers aria-live="polite">
          {formatMyr(total)}
        </Text>
      </Stack>
    </Stack>
  );
}
