import type { CartPayload, PackageName, PackagePrice, PackagePriceMap } from "@/types/order";
import {
  BUNDLE_SIZE,
  TICKET_TYPE_KEYS,
  type SavingsOpportunity,
  type TicketLine,
  type TicketPricing,
  type TicketSelections,
  type TicketType,
} from "@/types/ticket";

export function formatMyr(amount: number) {
  return `RM ${amount.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const PACKAGE_NAME_TO_CART_KEY: Record<PackageName, keyof CartPayload> = {
  NORMAL: "normal",
  NORMAL_BUNDLE: "normal_bundle",
  VIP: "vip",
  VIP_BUNDLE: "vip_bundle",
};

/** Maps the `/packages` response onto the same flat shape as `CartPayload`. */
export function toPackagePriceMap(packages: PackagePrice[]): PackagePriceMap {
  const prices: PackagePriceMap = {
    normal: 0,
    normal_bundle: 0,
    vip: 0,
    vip_bundle: 0,
  };
  for (const pkg of packages) {
    prices[PACKAGE_NAME_TO_CART_KEY[pkg.name]] = pkg.priceCents;
  }
  return prices;
}

/** The exact figure the backend expects as `paymentSum`: cart quantities times cents. */
export function computePaymentSum(cart: CartPayload, prices: PackagePriceMap): number {
  return (Object.keys(cart) as Array<keyof CartPayload>).reduce(
    (sum, key) => sum + cart[key] * prices[key],
    0,
  );
}

/** Converts cent prices into the per-ticket ringgit pricing the ticket lines use. */
export function toTicketPricing(prices: PackagePriceMap): TicketPricing {
  return {
    normal: { singlePrice: prices.normal / 100, bundlePrice: prices.normal_bundle / 100 },
    vip: { singlePrice: prices.vip / 100, bundlePrice: prices.vip_bundle / 100 },
  };
}

export function pluralizeTickets(count: number) {
  return count === 1 ? "ticket" : "tickets";
}

export function pluralizeBundles(count: number) {
  return count === 1 ? "bundle" : "bundles";
}

export function toTicketLines(
  selections: TicketSelections,
  pricing: TicketPricing,
): Record<TicketType, TicketLine> {
  return Object.fromEntries(
    TICKET_TYPE_KEYS.map((type) => {
      const selection = selections[type];
      const { singlePrice, bundlePrice } = pricing[type];

      return [
        type,
        {
          ...selection,
          seatCount: selection.singleCount + selection.bundleCount * BUNDLE_SIZE,
          subtotal: selection.singleCount * singlePrice + selection.bundleCount * bundlePrice,
        },
      ];
    }),
  ) as Record<TicketType, TicketLine>;
}

/** How much the buyer would save by folding eligible singles into bundles. */
export function toSavingsOpportunities(
  selections: TicketSelections,
  pricing: TicketPricing,
): Record<TicketType, SavingsOpportunity> {
  return Object.fromEntries(
    TICKET_TYPE_KEYS.map((type) => {
      const bundleCount = Math.floor(selections[type].singleCount / BUNDLE_SIZE);
      const { singlePrice, bundlePrice } = pricing[type];

      return [
        type,
        {
          bundleCount,
          singlesConverted: bundleCount * BUNDLE_SIZE,
          savings: bundleCount * (BUNDLE_SIZE * singlePrice - bundlePrice),
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
