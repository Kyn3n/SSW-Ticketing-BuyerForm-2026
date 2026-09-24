import { Button, Divider, Stack, Text } from "@astryxdesign/core";
import { formatMyr } from "@/data/mappers/helper";

type SubmitBarProps = {
  total: number;
  isSubmitting: boolean;
  mode?: "details" | "payment";
  isCheckingAvailability?: boolean;
  onBack?: () => void;
};

/** Order total and the submit action, split by the same rule as before. */
export function SubmitBar({
  total,
  isSubmitting,
  mode = "payment",
  isCheckingAvailability = false,
  onBack,
}: SubmitBarProps) {
  const isBusy = isSubmitting || isCheckingAvailability;

  return (
    <Stack direction="vertical" gap={5}>
      <Divider />
      <Stack
        direction="horizontal"
        justify="between"
        vAlign="center"
        wrap="wrap"
        gap={4}
      >
        <Stack direction="vertical" gap={0.5}>
          <Text type="supporting">Order total</Text>
          <Text type="display-3" hasTabularNumbers>
            {formatMyr(total)}
          </Text>
        </Stack>
        <Stack direction="horizontal" gap={3} wrap="wrap" justify="end">
          {mode === "payment" && onBack && (
            <Button
              type="button"
              label="Back to order details"
              variant="secondary"
              size="lg"
              onClick={onBack}
              isDisabled={isBusy}
            />
          )}
          <Button
            type="submit"
            label={
              mode === "details"
                ? isCheckingAvailability
                  ? "Checking availability..."
                  : "Continue to payment"
                : "Submit payment for review"
            }
            variant="primary"
            size="lg"
            isLoading={isBusy}
            isDisabled={isBusy}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
