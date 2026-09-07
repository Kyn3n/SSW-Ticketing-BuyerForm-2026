"use client";

import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useId,
  useMemo,
  useState,
} from "react";

const TICKET_PRICE = 120;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type SubmissionStage = "idle" | "preparing" | "uploading" | "creating";

type InitiateUploadResponse = {
  referenceId: string;
  uploadUrl: string;
  expiresAt: string;
};

type UploadResponse = {
  objectPath: string;
};

type CreateOrderResponse = {
  order: {
    id: string;
    reference: string;
    status: "pending";
    createdAt: string;
  };
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

    throw new Error(
      message,
    );
  }

  return body as T;
}

function validateReceipt(file: File): string | null {
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return "Upload a JPG, PNG, or WebP image.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "The receipt must be smaller than 5 MB.";
  }

  return null;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BuyerTicketForm() {
  const fileInputId = useId();
  const [seatCount, setSeatCount] = useState(1);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [stage, setStage] = useState<SubmissionStage>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [completedOrder, setCompletedOrder] =
    useState<CreateOrderResponse["order"] | null>(null);

  const total = useMemo(() => seatCount * TICKET_PRICE, [seatCount]);
  const isSubmitting = stage !== "idle";

  function chooseReceipt(file: File | undefined) {
    if (!file) return;

    const validationError = validateReceipt(file);
    setFileError(validationError);
    setReceipt(validationError ? null : file);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    chooseReceipt(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    chooseReceipt(event.dataTransfer.files?.[0]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!receipt) {
      setFileError("Add your payment receipt before submitting.");
      return;
    }

    const form = new FormData(event.currentTarget);

    try {
      setStage("preparing");
      const initiateResponse = await fetch("/api/orders/initiate-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: receipt.name,
          contentType: receipt.type,
          size: receipt.size,
        }),
      });
      const uploadDetails = await readJson<InitiateUploadResponse>(
        initiateResponse,
      );

      setStage("uploading");
      const uploadResponse = await fetch(uploadDetails.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": receipt.type },
        body: receipt,
      });
      const uploadedFile = await readJson<UploadResponse>(uploadResponse);

      setStage("creating");
      const createResponse = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          seatCount,
          receiptPath: uploadedFile.objectPath,
          uploadReference: uploadDetails.referenceId,
        }),
      });
      const created = await readJson<CreateOrderResponse>(createResponse);
      setCompletedOrder(created.order);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to submit your order.",
      );
    } finally {
      setStage("idle");
    }
  }

  if (completedOrder) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#121a25] px-5 py-12 text-[#f7f4ed]">
        <section className="w-full max-w-xl rounded-lg border border-white/15 bg-[#172231] p-7 shadow-2xl shadow-black/20 sm:p-10">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-[#c59042] text-2xl font-semibold text-[#121a25]">
            &#10003;
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#c59042]">
            Order received
          </p>
          <h1 className="text-3xl font-medium text-white sm:text-4xl">
            Payment under review
          </h1>
          <p className="mt-4 max-w-md leading-7 text-white/65">
            We have received your order and payment receipt. Your tickets will
            be emailed after our team verifies the payment.
          </p>

          <dl className="mt-8 divide-y divide-white/10 border-y border-white/10">
            <div className="flex items-center justify-between gap-6 py-4">
              <dt className="text-sm text-white/55">Order reference</dt>
              <dd className="font-mono text-sm font-semibold text-[#e1b66e]">
                {completedOrder.reference}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-6 py-4">
              <dt className="text-sm text-white/55">Status</dt>
              <dd className="text-sm font-medium text-white">Pending review</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={() => {
              setCompletedOrder(null);
              setReceipt(null);
              setSeatCount(1);
            }}
            className="mt-8 min-h-11 rounded-md border border-white/20 px-5 text-sm font-semibold text-white transition hover:border-[#c59042] hover:text-[#e1b66e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c59042]"
          >
            Submit another order
          </button>
        </section>
      </main>
    );
  }

  const progressText: Record<SubmissionStage, string> = {
    idle: "Submit payment for review",
    preparing: "Preparing secure upload...",
    uploading: "Uploading receipt...",
    creating: "Creating order...",
  };

  return (
    <main className="min-h-screen bg-[#121a25] px-4 py-8 text-[#f7f4ed] sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-7 flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#c59042] text-sm font-bold text-[#121a25]">
              SSW
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Summer Soundwave</p>
              <p className="text-xs text-white/45">Official ticketing</p>
            </div>
          </div>
          <p className="hidden text-xs font-medium uppercase tracking-[0.16em] text-white/40 sm:block">
            Secure order form
          </p>
        </header>

        <div className="grid overflow-hidden rounded-lg border border-white/15 bg-[#172231] shadow-2xl shadow-black/25 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="border-b border-white/10 bg-[#0e1620] p-6 lg:border-b-0 lg:border-r lg:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c59042]">
              Live event
            </p>
            <h1 className="mt-4 max-w-xs text-3xl font-medium leading-tight text-white sm:text-4xl">
              Summer Soundwave 2026
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/55">
              An intimate evening of live music, crafted sound, and a room full
              of people who came to listen.
            </p>

            <dl className="mt-8 divide-y divide-white/10 border-y border-white/10">
              <div className="py-4">
                <dt className="text-xs uppercase tracking-[0.14em] text-white/35">
                  Date
                </dt>
                <dd className="mt-1 text-sm text-white">17 October 2026</dd>
              </div>
              <div className="py-4">
                <dt className="text-xs uppercase tracking-[0.14em] text-white/35">
                  Venue
                </dt>
                <dd className="mt-1 text-sm text-white">
                  The Foundry Hall, Kuala Lumpur
                </dd>
              </div>
              <div className="py-4">
                <dt className="text-xs uppercase tracking-[0.14em] text-white/35">
                  Doors open
                </dt>
                <dd className="mt-1 text-sm text-white">6:30 PM</dd>
              </div>
            </dl>

            <div className="mt-8 border-l-2 border-[#c59042] pl-4">
              <p className="text-sm font-medium text-white">Manual verification</p>
              <p className="mt-1 text-xs leading-5 text-white/45">
                Tickets are issued by email after your receipt has been reviewed.
              </p>
            </div>
          </aside>

          <section className="p-6 sm:p-8 lg:p-10">
            <div className="mb-8 flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c59042]">
                  Ticket order
                </p>
                <h2 className="mt-2 text-2xl font-medium text-white">
                  Buyer details
                </h2>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/45">Price per seat</p>
                <p className="mt-1 text-base font-semibold text-white">
                  RM {TICKET_PRICE}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-white/80">
                    Full name
                  </span>
                  <input
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="As shown on your ID"
                    className="min-h-12 w-full rounded-md border border-white/15 bg-[#121a25] px-4 text-base text-white outline-none transition placeholder:text-white/25 focus:border-[#c59042] focus:ring-2 focus:ring-[#c59042]/25"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-white/80">
                    Email
                  </span>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    placeholder="you@example.com"
                    className="min-h-12 w-full rounded-md border border-white/15 bg-[#121a25] px-4 text-base text-white outline-none transition placeholder:text-white/25 focus:border-[#c59042] focus:ring-2 focus:ring-[#c59042]/25"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-white/80">
                    Phone
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    minLength={7}
                    maxLength={24}
                    placeholder="+60 12 345 6789"
                    className="min-h-12 w-full rounded-md border border-white/15 bg-[#121a25] px-4 text-base text-white outline-none transition placeholder:text-white/25 focus:border-[#c59042] focus:ring-2 focus:ring-[#c59042]/25"
                  />
                </label>
              </div>

              <div className="border-y border-white/10 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white/80">Seat quantity</p>
                    <p className="mt-1 text-xs text-white/40">Maximum 10 per order</p>
                  </div>
                  <div className="flex h-11 items-center overflow-hidden rounded-md border border-white/15 bg-[#121a25]">
                    <button
                      type="button"
                      aria-label="Decrease seat quantity"
                      onClick={() => setSeatCount((value) => Math.max(1, value - 1))}
                      disabled={seatCount === 1 || isSubmitting}
                      className="h-full w-11 text-xl text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:text-white/20 focus-visible:outline-2 focus-visible:outline-[#c59042]"
                    >
                      &minus;
                    </button>
                    <output
                      aria-live="polite"
                      className="flex h-full min-w-12 items-center justify-center border-x border-white/15 font-mono text-sm font-semibold text-white"
                    >
                      {seatCount}
                    </output>
                    <button
                      type="button"
                      aria-label="Increase seat quantity"
                      onClick={() => setSeatCount((value) => Math.min(10, value + 1))}
                      disabled={seatCount === 10 || isSubmitting}
                      className="h-full w-11 text-xl text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:text-white/20 focus-visible:outline-2 focus-visible:outline-[#c59042]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <section aria-labelledby="payment-heading">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c59042]">
                      Payment
                    </p>
                    <h3 id="payment-heading" className="mt-1 text-lg font-medium text-white">
                      Bank transfer receipt
                    </h3>
                  </div>
                  <p className="text-right">
                    <span className="block text-xs text-white/40">Amount due</span>
                    <span className="text-xl font-semibold text-[#e1b66e]">
                      RM {total.toLocaleString("en-MY")}
                    </span>
                  </p>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
                  <div className="flex min-h-36 items-center gap-4 rounded-md border border-white/10 bg-[#121a25] p-4 sm:flex-col sm:justify-center sm:text-center">
                    <div
                      aria-hidden="true"
                      className="grid h-20 w-20 shrink-0 grid-cols-4 gap-1 bg-white p-2"
                    >
                      {[0, 1, 3, 4, 6, 9, 10, 12, 14, 15].map((cell) => (
                        <span
                          key={cell}
                          style={{ gridArea: `${Math.floor(cell / 4) + 1} / ${(cell % 4) + 1}` }}
                          className="bg-[#121a25]"
                        />
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Mock payment QR</p>
                      <p className="mt-1 text-xs leading-5 text-white/40">
                        Use the exact amount shown above.
                      </p>
                    </div>
                  </div>

                  <label
                    htmlFor={fileInputId}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-5 text-center transition focus-within:ring-2 focus-within:ring-[#c59042]/40 ${
                      isDragging
                        ? "border-[#c59042] bg-[#c59042]/8"
                        : fileError
                          ? "border-red-400/70 bg-red-400/5"
                          : "border-[#c59042]/60 bg-[#121a25] hover:border-[#c59042]"
                    }`}
                  >
                    <input
                      id={fileInputId}
                      type="file"
                      accept={ACCEPTED_FILE_TYPES.join(",")}
                      required
                      disabled={isSubmitting}
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                    <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#c59042]/50 text-lg text-[#e1b66e]">
                      &uarr;
                    </span>
                    {receipt ? (
                      <>
                        <span className="max-w-full truncate text-sm font-medium text-white">
                          {receipt.name}
                        </span>
                        <span className="mt-1 text-xs text-white/40">
                          {formatFileSize(receipt.size)} &middot; Click to replace
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-white">
                          Upload payment receipt
                        </span>
                        <span className="mt-1 text-xs text-white/40">
                          JPG, PNG, or WebP &middot; Max 5 MB
                        </span>
                      </>
                    )}
                  </label>
                </div>
                {fileError && (
                  <p className="mt-2 text-sm text-red-300" role="alert">
                    {fileError}
                  </p>
                )}
              </section>

              <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-white/40">Order total</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    RM {total.toLocaleString("en-MY")}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-12 rounded-md bg-[#c59042] px-7 text-sm font-bold text-[#121a25] transition hover:bg-[#d7a95f] disabled:cursor-wait disabled:bg-[#c59042]/55 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c59042]"
                >
                  {progressText[stage]}
                </button>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="border-l-2 border-red-400 bg-red-400/5 px-4 py-3 text-sm text-red-200"
                >
                  {formError}
                </div>
              )}

              <p className="text-xs leading-5 text-white/35">
                Your order remains pending until the payment has been manually
                verified. Tickets and the invoice will be sent by email.
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
