/**
 * Ticket catalogue. Singles and bundles are tracked separately because the
 * buyer picks them separately — prices come from the backend's `/packages`
 * endpoint and the totals derive everything else (see mappers/helper.ts).
 */
export const TICKET_TYPES = {
  normal: { label: "Normal" },
  vip: { label: "VIP" },
} as const;

export const BUNDLE_SIZE = 4;

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

/** Per-ticket-type prices in ringgit, derived from the fetched package prices. */
export type TicketPricing = Record<
  TicketType,
  { singlePrice: number; bundlePrice: number }
>;

export const TICKET_TYPE_KEYS = Object.keys(TICKET_TYPES) as TicketType[];

export const INITIAL_TICKET_SELECTIONS: TicketSelections = {
  normal: { singleCount: 0, bundleCount: 0 },
  vip: { singleCount: 0, bundleCount: 0 },
};
