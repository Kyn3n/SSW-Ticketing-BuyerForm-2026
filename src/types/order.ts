import type { TicketLine, TicketType } from "@/types/ticket";

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_FILE_TYPES = "image/jpeg,image/png,image/webp";

export type SubmissionStage = "idle" | "preparing" | "uploading" | "creating";

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

export type InitiateImageUploadResponse = {
  imageUrl: string;
  imageUUID: string;
};

export type PaymentQrResponse = {
  imageUrl: string;
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

export type ErrorResponse = {
  error?: string;
};
