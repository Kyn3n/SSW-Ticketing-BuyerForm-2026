import type { CartPayload } from "@/types/order";
import {
  BUNDLE_PAID_SEATS,
  BUNDLE_SIZE,
  TICKET_TYPE_KEYS,
  TICKET_TYPES,
  type SavingsOpportunity,
  type TicketLine,
  type TicketSelections,
  type TicketType,
} from "@/types/ticket";

export function formatMyr(amount: number) {
  return `RM ${amount.toLocaleString("en-MY")}`;
}

export function pluralizeTickets(count: number) {
  return count === 1 ? "ticket" : "tickets";
}

export function pluralizeBundles(count: number) {
  return count === 1 ? "bundle" : "bundles";
}

export function toTicketLines(
  selections: TicketSelections,
): Record<TicketType, TicketLine> {
  return Object.fromEntries(
    TICKET_TYPE_KEYS.map((type) => {
      const selection = selections[type];

      return [
        type,
        {
          ...selection,
          seatCount: selection.singleCount + selection.bundleCount * BUNDLE_SIZE,
          subtotal:
            (selection.singleCount + selection.bundleCount * BUNDLE_PAID_SEATS) *
            TICKET_TYPES[type].price,
        },
      ];
    }),
  ) as Record<TicketType, TicketLine>;
}

/** How much the buyer would save by folding eligible singles into bundles. */
export function toSavingsOpportunities(
  selections: TicketSelections,
): Record<TicketType, SavingsOpportunity> {
  return Object.fromEntries(
    TICKET_TYPE_KEYS.map((type) => {
      const bundleCount = Math.floor(selections[type].singleCount / BUNDLE_SIZE);

      return [
        type,
        {
          bundleCount,
          singlesConverted: bundleCount * BUNDLE_SIZE,
          savings: bundleCount * TICKET_TYPES[type].price,
        },
      ];
    }),
  ) as Record<TicketType, SavingsOpportunity>;
}

/** Converts every eligible group of singles into a bundle, seat count unchanged. */
export function withBundleSavingsApplied(
  selections: TicketSelections,
): TicketSelections {
  return Object.fromEntries(
    TICKET_TYPE_KEYS.map((type) => [
      type,
      {
        singleCount: selections[type].singleCount % BUNDLE_SIZE,
        bundleCount:
          selections[type].bundleCount +
          Math.floor(selections[type].singleCount / BUNDLE_SIZE),
      },
    ]),
  ) as TicketSelections;
}

export function sumSeats(lines: Record<TicketType, TicketLine>) {
  return TICKET_TYPE_KEYS.reduce((total, type) => total + lines[type].seatCount, 0);
}

export function sumTotal(lines: Record<TicketType, TicketLine>) {
  return TICKET_TYPE_KEYS.reduce((total, type) => total + lines[type].subtotal, 0);
}

/** Maps the buyer's single/bundle picks onto the backend's flat cart shape. */
export function toCartPayload(ticketSelections: TicketSelections): CartPayload {
  return {
    normal: ticketSelections.normal.singleCount,
    normal_bundle: ticketSelections.normal.bundleCount,
    vip: ticketSelections.vip.singleCount,
    vip_bundle: ticketSelections.vip.bundleCount,
  };
}

/**
 * The buyer-facing order reference: the first block of the order UUID, which
 * is short enough to read out over the phone while staying unique enough for
 * support to find the order. Falls back to the leading characters for ids
 * that are not hyphenated.
 */
export function toOrderReference(orderId: string) {
  const [firstBlock] = orderId.split("-");
  return (firstBlock || orderId).slice(0, 8).toUpperCase();
}
