import { NumberInput, Stack, Text } from "@astryxdesign/core";

type QuantityFieldProps = {
  label: string;
  description: string;
  value: number;
  min?: number;
  max?: number;
  isDisabled?: boolean;
  disabledMessage?: string;
  onChange: (value: number) => void;
};

/**
 * Label and price on the left, an Astryx stepper on the right — the row
 * layout the form has always used, now driven by `NumberInput`.
 */
export function QuantityField({
  label,
  description,
  value,
  min = 0,
  max,
  isDisabled,
  disabledMessage,
  onChange,
}: QuantityFieldProps) {
  return (
    <Stack
      direction="horizontal"
      justify="between"
      vAlign="center"
      wrap="wrap"
      gap={3}
    >
      <Stack direction="vertical" gap={0.5} style={{ minWidth: 0, flex: "1 1 180px" }}>
        <Text type="label">{label}</Text>
        <Text type="supporting">{description}</Text>
      </Stack>
      <NumberInput
        label={label}
        isLabelHidden
        value={value}
        min={min}
        max={max}
        isIntegerOnly
        hasNumberSteppers
        isDisabled={isDisabled}
        disabledMessage={disabledMessage}
        size="lg"
        width={132}
        onChange={onChange}
      />
    </Stack>
  );
}
