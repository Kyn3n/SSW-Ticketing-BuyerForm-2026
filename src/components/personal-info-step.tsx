import { Stack, TextInput } from "@astryxdesign/core";
import { toStatus, type BuyerFieldErrors } from "@/lib/buyer-validation";
import type { BuyerDetails } from "@/types/order";
import { AccentNote } from "./accent-note";

type PersonalInfoStepProps = {
  values: BuyerDetails;
  errors: BuyerFieldErrors;
  isDisabled: boolean;
  onChange: (field: keyof BuyerDetails, value: string) => void;
};

/** Step 3: one field per row, each validated before the buyer can move on. */
export function PersonalInfoStep({
  values,
  errors,
  isDisabled,
  onChange,
}: PersonalInfoStepProps) {
  return (
    <Stack direction="vertical" gap={5}>
      <TextInput
        label="Full name"
        description="Exactly as it appears on the ID you will bring."
        placeholder="Nurul Aisyah binti Rahman"
        autoComplete="name"
        isRequired
        htmlName="name"
        size="lg"
        value={values.name}
        status={toStatus(errors.name)}
        isDisabled={isDisabled}
        onChange={(value) => onChange("name", value)}
      />

      <TextInput
        label="Email"
        type="email"
        description="Your tickets and invoice are sent here."
        placeholder="you@example.com"
        autoComplete="email"
        isRequired
        htmlName="email"
        size="lg"
        value={values.email}
        status={toStatus(errors.email)}
        isDisabled={isDisabled}
        onChange={(value) => onChange("email", value)}
      />

      <TextInput
        label="Phone"
        description="Used only if we need to reach you about the payment."
        placeholder="+60 12 345 6789"
        autoComplete="tel"
        isRequired
        htmlName="phone"
        size="lg"
        value={values.phone}
        status={toStatus(errors.phone)}
        isDisabled={isDisabled}
        onChange={(value) => onChange("phone", value)}
      />

      <AccentNote title="We keep this to ourselves">
        These details are used to issue and deliver your tickets. Nothing else.
      </AccentNote>
    </Stack>
  );
}
