import type { TicketLine, TicketType } from "@/types/ticket";

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_FILE_TYPES = "image/jpeg,image/png,image/webp";

/** Country code shown as a fixed prefix beside the phone input; `BuyerDetails.phone` holds only the digits after it. */
export const PHONE_COUNTRY_CODE = "60";

export type BuyerDetails = {
  name: string;
  email: string;
  phone: string;
};

export type CompletedOrder = {
  /** Full order UUID, kept for support lookups and never shown to the buyer. */
  id: string;
  /** Short, buyer-facing prefix of `id`. */
  reference: string;
  /** Where the tickets will be sent once the payment clears. */
  email: string;
  status: string;
  createdAt: string;
  ticketSelections: Record<TicketType, TicketLine>;
  seatCount: number;
  amount: number;
};

export type CartPayload = {
  normal: number;
  normal_bundle: number;
  vip: number;
  vip_bundle: number;
};

export type PackageName = "NORMAL" | "NORMAL_BUNDLE" | "VIP" | "VIP_BUNDLE";

export type PackagePrice = {
  name: PackageName;
  priceCents: number;
};

export type TicketTypeName = "NORMAL" | "VIP";

/** Seats left per ticket type, shared by a package and its bundle counterpart. */
export type SeatsRemaining = Record<Lowercase<TicketTypeName>, number>;

export type PackagesResponse = {
  ok: boolean;
  packages: PackagePrice[];
  seatsRemaining: SeatsRemaining;
};

export type PackagesData = Pick<PackagesResponse, "packages" | "seatsRemaining">;

/** Package prices in cents, keyed the same way as `CartPayload`. */
export type PackagePriceMap = Record<keyof CartPayload, number>;

export type InitiateImageUploadResponse = {
  imageUrl: string;
  imageUUID: string;
};

export type CreateOrderResponse = {
  ok: boolean;
  order: {
    orderId: string;
    status: string;
    seatCount: number;
    items: Array<{ package: string; quantity: number; seats: number }>;
    seatsByTicketType: { normal: number; vip: number };
  };
};

/** One ticket type's shortfall detail on a 409 INSUFFICIENT_CAPACITY response. */
export type TicketTypeShortfall = {
  ticketType: TicketTypeName;
  requestedSeats: number;
  availableSeats: number;
  sufficient: boolean;
};

export type ErrorResponse = {
  error?: string;
  ticketTypes?: TicketTypeShortfall[];
};
