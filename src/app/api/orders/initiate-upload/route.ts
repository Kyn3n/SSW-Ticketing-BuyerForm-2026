import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createMockUploadUrl } from "@/lib/mock-upload";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const uploadRequestSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  size: z.number().int().positive().max(MAX_FILE_SIZE),
});

export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null);
  const result = uploadRequestSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json(
      { error: "Choose a JPG, PNG, or WebP receipt smaller than 5 MB." },
      { status: 400 },
    );
  }

  const referenceId = randomUUID();
  const { uploadUrl, expiresAt } = createMockUploadUrl(referenceId);

  return NextResponse.json({
    referenceId,
    uploadUrl,
    expiresAt,
  });
}
