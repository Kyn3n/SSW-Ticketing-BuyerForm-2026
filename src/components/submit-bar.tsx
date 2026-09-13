import { Button, Divider, Stack, Text } from "@astryxdesign/core";
import { formatMyr } from "@/data/mappers/helper";
import type { SubmissionStage } from "@/types/order";

const PROGRESS_TEXT: Record<SubmissionStage, string> = {
  idle: "Submit payment for review",
  preparing: "Preparing secure upload...",
  uploading: "Uploading receipt...",
  creating: "Creating order...",
};

type SubmitBarProps = {
  total: number;
  stage: SubmissionStage;
};

/** Order total and the submit action, split by the same rule as before. */
export function SubmitBar({ total, stage }: SubmitBarProps) {
  const isSubmitting = stage !== "idle";

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
        <Button
          type="submit"
          label={PROGRESS_TEXT[stage]}
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
        />
      </Stack>
    </Stack>
  );
}
