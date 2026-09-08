import { randomUUID } from "node:crypto";
import { stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { appendMockOrder, type MockOrder } from "@/lib/mock-orders";

const orderSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(24)
    .regex(/^[+()\-\s\d]+$/, "Enter a valid phone number."),
  ticketSelections: z.object({
    normal: z.object({
      singleCount: z.number().int().min(0),
      bundleCount: z.number().int().min(0),
    }),
    vip: z.object({
      singleCount: z.number().int().min(0),
      bundleCount: z.number().int().min(0),
    }),
  }),
  receiptPath: z
    .string()
    .regex(/^\/mock-bucket\/[0-9a-f-]{36}\.(jpg|png|webp)$/),
  uploadReference: z.string().uuid(),
});

function createReference(id: string) {
  return `SSW-${id.slice(0, 8).toUpperCase()}`;
}

export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null);
  const result = orderSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Check your buyer details and payment receipt, then try again.",
        fields: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (!result.data.receiptPath.includes(result.data.uploadReference)) {
    return NextResponse.json(
      { error: "The uploaded receipt does not match this order." },
      { status: 400 },
    );
  }

  const ticketSelections = {
    normal: {
      ...result.data.ticketSelections.normal,
      seatCount:
        result.data.ticketSelections.normal.singleCount +
        result.data.ticketSelections.normal.bundleCount * 4,
      subtotal:
        (result.data.ticketSelections.normal.singleCount +
          result.data.ticketSelections.normal.bundleCount * 3) *
        40,
    },
    vip: {
      ...result.data.ticketSelections.vip,
      seatCount:
        result.data.ticketSelections.vip.singleCount +
        result.data.ticketSelections.vip.bundleCount * 4,
      subtotal:
        (result.data.ticketSelections.vip.singleCount +
          result.data.ticketSelections.vip.bundleCount * 3) *
        60,
    },
  };
  const seatCount =
    ticketSelections.normal.seatCount + ticketSelections.vip.seatCount;
  const amount =
    ticketSelections.normal.subtotal + ticketSelections.vip.subtotal;

  const hasSafeTotals = [
    ticketSelections.normal.seatCount,
    ticketSelections.normal.subtotal,
    ticketSelections.vip.seatCount,
    ticketSelections.vip.subtotal,
    seatCount,
    amount,
  ].every(Number.isSafeInteger);

  if (seatCount === 0 || !hasSafeTotals) {
    return NextResponse.json(
      { error: "The selected ticket quantity or total is invalid." },
      { status: 400 },
    );
  }

  const receiptFile = path.join(
    process.cwd(),
    "public",
    ...result.data.receiptPath.split("/").filter(Boolean),
  );

  try {
    const receiptStats = await stat(receiptFile);
    if (!receiptStats.isFile()) throw new Error("Receipt path is not a file.");
  } catch {
    return NextResponse.json(
      { error: "Upload the payment receipt before creating the order." },
      { status: 400 },
    );
  }

  const id = randomUUID();
  const order: MockOrder = {
    id,
    reference: createReference(id),
    name: result.data.name,
    email: result.data.email,
    phone: result.data.phone,
    ticketSelections,
    seatCount,
    amount,
    receiptPath: result.data.receiptPath,
    uploadReference: result.data.uploadReference,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  console.info("[mock-order] created", order);
  await appendMockOrder(order);

  return NextResponse.json(
    {
      order: {
        id: order.id,
        reference: order.reference,
        status: order.status,
        createdAt: order.createdAt,
        ticketSelections: order.ticketSelections,
        seatCount: order.seatCount,
        amount: order.amount,
      },
    },
    { status: 201 },
  );
}
