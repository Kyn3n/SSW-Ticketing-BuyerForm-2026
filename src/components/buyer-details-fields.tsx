import { Grid, Stack, TextInput } from "@astryxdesign/core";
import { toStatus, type BuyerFieldErrors } from "@/lib/buyer-validation";
import type { BuyerDetails } from "@/lib/orders";

type BuyerDetailsFieldsProps = {
  values: BuyerDetails;
  errors: BuyerFieldErrors;
  isDisabled: boolean;
  onChange: (field: keyof BuyerDetails, value: string) => void;
};

/** Name across the top, email and phone side by side beneath it. */
export function BuyerDetailsFields({
  values,
  errors,
  isDisabled,
  onChange,
}: BuyerDetailsFieldsProps) {
  return (
    <Stack direction="vertical" gap={5}>
      <TextInput
        label="Full name"
        placeholder="As shown on your ID"
        autoComplete="name"
        isRequired
        htmlName="name"
        size="lg"
        value={values.name}
        status={toStatus(errors.name)}
        isDisabled={isDisabled}
        onChange={(value) => onChange("name", value)}
      />

      <Grid columns={{ minWidth: 220, max: 2 }} gap={5}>
        <TextInput
          label="Email"
          type="email"
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
      </Grid>
    </Stack>
  );
}
