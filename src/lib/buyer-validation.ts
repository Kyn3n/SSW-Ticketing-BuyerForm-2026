import type { InputStatus } from "@astryxdesign/core";
import type { BuyerDetails } from "@/lib/orders";

export type BuyerFieldErrors = Partial<Record<keyof BuyerDetails, string>>;

export function validateBuyerDetails(details: BuyerDetails): BuyerFieldErrors {
  const errors: BuyerFieldErrors = {};

  if (details.name.trim().length < 2) {
    errors.name = "Enter your full name.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!/^[+()\-\s\d]{7,24}$/.test(details.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }

  return errors;
}

/** Turns an error message into the shape Astryx inputs expect. */
export function toStatus(message: string | undefined | null): InputStatus | undefined {
  return message ? { type: "error", message } : undefined;
}
