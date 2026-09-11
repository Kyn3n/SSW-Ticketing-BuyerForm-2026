/**
 * Ticket catalogue and the pricing rules that go with it.
 *
 * A bundle is 4 tickets for the price of 3, so every bundle is worth one free
 * ticket. Singles and bundles are tracked separately because the buyer picks
 * them separately — the totals below derive everything else.
 */
export const TICKET_TYPES = {
  normal: { label: "Normal", price: 40 },
  vip: { label: "VIP", price: 60 },
} as const;

export const BUNDLE_SIZE = 4;
export const BUNDLE_PAID_SEATS = 3;

export type TicketType = keyof typeof TICKET_TYPES;

export type TicketCounts = {
  singleCount: number;
  bundleCount: number;
};

export type TicketSelections = Record<TicketType, TicketCounts>;

export type TicketLine = TicketCounts & {
  seatCount: number;
  subtotal: number;
};

export type SavingsOpportunity = {
  bundleCount: number;
  singlesConverted: number;
  savings: number;
};

export const TICKET_TYPE_KEYS = Object.keys(TICKET_TYPES) as TicketType[];

export const INITIAL_TICKET_SELECTIONS: TicketSelections = {
  normal: { singleCount: 1, bundleCount: 0 },
  vip: { singleCount: 0, bundleCount: 0 },
};

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
