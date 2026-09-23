import axios from "axios";
import { toCartPayload, toOrderReference } from "@/data/mappers/helper";
import {
  PHONE_COUNTRY_CODE,
  type BuyerDetails,
  type CreateOrderResponse,
  type ErrorResponse,
  type InitiateImageUploadResponse,
  type PackagesData,
  type PackagesResponse,
  type SubmissionStage,
  type TicketTypeShortfall,
} from "@/types/order";
import type { CompletedOrder } from "@/types/order";
import type { TicketLine, TicketSelections, TicketType } from "@/types/ticket";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

function getErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ErrorResponse | undefined;
    if (data?.error) return data.error;
  }
  return fallback;
}

/**
 * Thrown when the backend rejects an order because one or more requested
 * ticket types no longer have enough seats (either a real shortfall or a
 * lost reservation race) — carries the fresh per-type breakdown so the form
 * can tell the buyer exactly what's short.
 */
export class InsufficientCapacityError extends Error {
  ticketTypes: TicketTypeShortfall[];

  constructor(ticketTypes: TicketTypeShortfall[]) {
    super("Not enough seats remain for one or more ticket types.");
    this.name = "InsufficientCapacityError";
    this.ticketTypes = ticketTypes;
  }
}

/** Reserves an upload slot for the receipt and returns its stored image id. */
async function uploadReceiptImage(
  receipt: File,
  onStageChange: (stage: SubmissionStage) => void,
): Promise<string> {
  onStageChange("preparing");
  let imageUrl: string;
  let imageUUID: string;
  try {
    const { data } = await apiClient.post<InitiateImageUploadResponse>(
      "/api/v1/public/order/image",
      { contentType: receipt.type },
    );
    ({ imageUrl, imageUUID } = data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }

  onStageChange("uploading");
  try {
    await axios.put(imageUrl, receipt, {
      headers: { "Content-Type": receipt.type },
    });
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Unable to upload your receipt. Please try again."),
    );
  }

  return imageUUID;
}

/** Fetches the current price of each package and remaining seats per ticket type. */
export async function getPackagePrices(): Promise<PackagesData> {
  try {
    const { data } = await apiClient.get<PackagesResponse>(
      "/api/v1/public/packages",
    );
    return { packages: data.packages, seatsRemaining: data.seatsRemaining };
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load ticket prices."));
  }
}

async function createOrder(
  buyerDetails: BuyerDetails,
  ticketSelections: TicketSelections,
  screenshotImageId: string,
  paymentSum: number,
): Promise<CreateOrderResponse> {
  try {
    const { data } = await apiClient.post<CreateOrderResponse>("/api/v1/public/order", {
      email: buyerDetails.email,
      name: buyerDetails.name,
      phone: PHONE_COUNTRY_CODE + buyerDetails.phone,
      cart: toCartPayload(ticketSelections),
      screenshotImageId,
      paymentSum,
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as ErrorResponse | undefined;
      if (
        error.response?.status === 409 &&
        data?.error === "INSUFFICIENT_CAPACITY" &&
        data.ticketTypes
      ) {
        throw new InsufficientCapacityError(data.ticketTypes);
      }
    }
    throw new Error(getErrorMessage(error));
  }
}

type SubmitOrderInput = {
  buyerDetails: BuyerDetails;
  ticketSelections: TicketSelections;
  ticketLines: Record<TicketType, TicketLine>;
  total: number;
  /** Cents; Σ(cart[package] × priceCents[package]) from the fetched package prices. */
  paymentSum: number;
  receipt: File;
  onStageChange: (stage: SubmissionStage) => void;
};

/**
 * Two-step submission: upload the receipt to get an image id, then create
 * the order that points at it.
 */
export async function submitOrder({
  buyerDetails,
  ticketSelections,
  ticketLines,
  total,
  paymentSum,
  receipt,
  onStageChange,
}: SubmitOrderInput): Promise<CompletedOrder> {
  const screenshotImageId = await uploadReceiptImage(receipt, onStageChange);

  onStageChange("creating");
  const created = await createOrder(
    buyerDetails,
    ticketSelections,
    screenshotImageId,
    paymentSum,
  );

  return {
    id: created.order.orderId,
    reference: toOrderReference(created.order.orderId),
    email: buyerDetails.email,
    status: created.order.status,
    createdAt: new Date().toISOString(),
    ticketSelections: ticketLines,
    seatCount: created.order.seatCount,
    amount: total,
  };
}
