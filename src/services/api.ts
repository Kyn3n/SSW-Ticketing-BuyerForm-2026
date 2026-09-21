import axios from "axios";
import { toCartPayload, toOrderReference } from "@/data/mappers/helper";
import {
  PHONE_COUNTRY_CODE,
  type BuyerDetails,
  type CreateOrderResponse,
  type ErrorResponse,
  type InitiateImageUploadResponse,
  type PackagePrice,
  type PackagesResponse,
  type PaymentQrResponse,
  type SubmissionStage,
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

/** Fetches the current price of each package, in cents. */
export async function getPackagePrices(): Promise<PackagePrice[]> {
  try {
    const { data } = await apiClient.get<PackagesResponse>(
      "/api/v1/public/packages",
    );
    return data.packages;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load ticket prices."));
  }
}

/** Fetches a freshly signed URL for the payment QR code image. */
export async function getPaymentQr(): Promise<string> {
  try {
    const { data } = await apiClient.get<PaymentQrResponse>(
      "/api/v1/public/payment-qr",
    );
    return data.imageUrl;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Unable to load the payment QR code."),
    );
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
