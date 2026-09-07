import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidMockUploadUrl } from "@/lib/mock-upload";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const referenceSchema = z.string().uuid();
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function matchesImageType(bytes: Buffer, contentType: string) {
  if (contentType === "image/jpeg") {
    return bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  }

  if (contentType === "image/png") {
    return bytes
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  return (
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

export async function PUT(
  request: Request,
  context: RouteContext<"/api/mock-bucket/[referenceId]">,
) {
  const { referenceId } = await context.params;
  const referenceResult = referenceSchema.safeParse(referenceId);
  const url = new URL(request.url);
  const contentType = request.headers.get("content-type")?.split(";")[0];
  const extension = contentType ? extensions[contentType] : undefined;

  if (
    !referenceResult.success ||
    !extension ||
    !isValidMockUploadUrl(
      referenceId,
      url.searchParams.get("expires"),
      url.searchParams.get("signature"),
    )
  ) {
    return NextResponse.json(
      { error: "The upload request is invalid." },
      { status: 400 },
    );
  }

  const declaredSize = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredSize) && declaredSize > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "The receipt must be smaller than 5 MB." },
      { status: 413 },
    );
  }

  const bytes = Buffer.from(await request.arrayBuffer());
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "The receipt is empty or larger than 5 MB." },
      { status: 413 },
    );
  }

  if (!matchesImageType(bytes, contentType!)) {
    return NextResponse.json(
      { error: "The uploaded bytes do not match the selected image type." },
      { status: 415 },
    );
  }

  const bucketDirectory = path.join(process.cwd(), "public", "mock-bucket");
  const fileName = `${referenceResult.data}.${extension}`;
  const destination = path.join(bucketDirectory, fileName);

  await mkdir(bucketDirectory, { recursive: true });
  await writeFile(destination, bytes, { flag: "wx" });

  return NextResponse.json(
    { objectPath: `/mock-bucket/${fileName}` },
    { status: 201 },
  );
}
