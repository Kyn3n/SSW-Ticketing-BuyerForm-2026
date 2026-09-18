/**
 * Ticket catalogue and the pricing rules that go with it.
 *
 * A bundle is 4 tickets for the price of 3, so every bundle is worth one free
 * ticket. Singles and bundles are tracked separately because the buyer picks
 * them separately — the totals derive everything else (see mappers/helper.ts).
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
