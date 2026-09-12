import { validateBuyerDetails, type BuyerFieldErrors } from "@/lib/buyer-validation";
import type { BuyerDetails } from "@/lib/orders";

export const STEP_IDS = ["intro", "seats", "details", "payment"] as const;

export type StepId = (typeof STEP_IDS)[number];

export type StepDefinition = {
  id: StepId;
  /** 1-based number shown in the folder tab and the back button. */
  number: number;
  label: string;
  title: string;
  description: string;
};

export const STEPS: StepDefinition[] = [
  {
    id: "intro",
    number: 1,
    label: "Intro",
    title: "Before you begin",
    description:
      "Everything you need to know about the night, and how this order form works.",
  },
  {
    id: "seats",
    number: 2,
    label: "Select Seats",
    title: "Choose your tickets",
    description:
      "Open a tier to pick singles or bundles. Bundles give you a fourth ticket free.",
  },
  {
    id: "details",
    number: 3,
    label: "Personal Info",
    title: "Who are the tickets for?",
    description: "We send the tickets and the invoice to the details below.",
  },
  {
    id: "payment",
    number: 4,
    label: "Payment",
    title: "Pay and upload your receipt",
    description:
      "Transfer the exact total, then attach the receipt so our team can verify it.",
  },
];

export function stepIndex(id: StepId) {
  return STEPS.findIndex((step) => step.id === id);
}

export function stepAt(index: number): StepDefinition | undefined {
  return STEPS[index];
}

/** Everything the per-step validators need to see. */
export type StepDraft = {
  buyerDetails: BuyerDetails;
  seatCount: number;
  receipt: File | null;
};

export type StepErrors = {
  buyer: BuyerFieldErrors;
  seats: string | null;
  receipt: string | null;
};

export const NO_STEP_ERRORS: StepErrors = { buyer: {}, seats: null, receipt: null };

/**
 * Validates only what the given step is responsible for, so moving forward
 * never complains about a field the buyer has not reached yet.
 */
export function validateStep(id: StepId, draft: StepDraft): StepErrors {
  switch (id) {
    case "seats":
      return {
        ...NO_STEP_ERRORS,
        seats:
          draft.seatCount > 0 ? null : "Add at least one ticket to continue.",
      };
    case "details":
      return { ...NO_STEP_ERRORS, buyer: validateBuyerDetails(draft.buyerDetails) };
    case "payment":
      return {
        ...NO_STEP_ERRORS,
        receipt: draft.receipt
          ? null
          : "Attach your payment receipt before submitting.",
      };
    case "intro":
    default:
      return NO_STEP_ERRORS;
  }
}

export function hasStepErrors(errors: StepErrors) {
  return (
    Boolean(errors.seats) ||
    Boolean(errors.receipt) ||
    Object.values(errors.buyer).some(Boolean)
  );
}

/** Steps the buyer has satisfied, used to mark folder tabs as complete. */
export function completedSteps(draft: StepDraft): Set<StepId> {
  const done = new Set<StepId>(["intro"]);

  for (const id of ["seats", "details", "payment"] as const) {
    if (!hasStepErrors(validateStep(id, draft))) done.add(id);
  }

  return done;
}
