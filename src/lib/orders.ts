import type { TicketLine, TicketSelections, TicketType } from "@/lib/tickets";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_FILE_TYPES = "image/jpeg,image/png,image/webp";

export type SubmissionStage = "idle" | "preparing" | "uploading" | "creating";

export type BuyerDetails = {
  name: string;
  email: string;
  phone: string;
};

export type CompletedOrder = {
  id: string;
  reference: string;
  status: "pending";
  createdAt: string;
  ticketSelections: Record<TicketType, TicketLine>;
  seatCount: number;
  amount: number;
};

type InitiateUploadResponse = {
  referenceId: string;
  uploadUrl: string;
  expiresAt: string;
};

type UploadResponse = {
  objectPath: string;
};

type CreateOrderResponse = {
  order: CompletedOrder;
};

type ErrorResponse = {
  error?: string;
};

async function readJson<T>(response: Response): Promise<T> {
  const body: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as ErrorResponse).error === "string"
        ? (body as ErrorResponse).error
        : "Something went wrong.";

    throw new Error(message);
  }

  return body as T;
}

type SubmitOrderInput = {
  buyerDetails: BuyerDetails;
  ticketSelections: TicketSelections;
  receipt: File;
  onStageChange: (stage: SubmissionStage) => void;
};

/**
 * Three-step submission: reserve an upload slot, PUT the receipt to it, then
 * create the order that points at the stored object.
 */
export async function submitOrder({
  buyerDetails,
  ticketSelections,
  receipt,
  onStageChange,
}: SubmitOrderInput): Promise<CompletedOrder> {
  onStageChange("preparing");
  const initiateResponse = await fetch(`${API_BASE_URL}/orders/initiate-upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: receipt.name,
      contentType: receipt.type,
      size: receipt.size,
    }),
  });
  const uploadDetails = await readJson<InitiateUploadResponse>(initiateResponse);

  onStageChange("uploading");
  const uploadResponse = await fetch(uploadDetails.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": receipt.type },
    body: receipt,
  });
  const uploadedFile = await readJson<UploadResponse>(uploadResponse);

  onStageChange("creating");
  const createResponse = await fetch(`${API_BASE_URL}/orders/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: buyerDetails.name,
      email: buyerDetails.email,
      phone: buyerDetails.phone,
      ticketSelections,
      receiptPath: uploadedFile.objectPath,
      uploadReference: uploadDetails.referenceId,
    }),
  });
  const created = await readJson<CreateOrderResponse>(createResponse);

  return created.order;
}
