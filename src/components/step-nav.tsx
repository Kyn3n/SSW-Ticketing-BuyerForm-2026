import { Button, Divider, Stack, Text } from "@astryxdesign/core";
import type { SubmissionStage } from "@/lib/orders";
import type { StepDefinition } from "@/lib/steps";
import { STEPS } from "@/lib/steps";

const PROGRESS_TEXT: Record<SubmissionStage, string> = {
  idle: "Submit payment for review",
  preparing: "Preparing secure upload...",
  uploading: "Uploading receipt...",
  creating: "Creating order...",
};

type StepNavProps = {
  currentStep: StepDefinition;
  previousStep?: StepDefinition;
  nextStep?: StepDefinition;
  stage: SubmissionStage;
  onPrevious: () => void;
};

/**
 * Bottom rail: back to the numbered step behind you, forward to the next one.
 * On the last step the forward button becomes the submit action — both are
 * the form's submit button, so the step's fields validate on the way through.
 */
export function StepNav({
  currentStep,
  previousStep,
  nextStep,
  stage,
  onPrevious,
}: StepNavProps) {
  const isSubmitting = stage !== "idle";

  return (
    <Stack direction="vertical" gap={5}>
      <Divider />
      <Stack
        direction="horizontal"
        justify="between"
        vAlign="center"
        wrap="wrap"
        gap={3}
      >
        {previousStep ? (
          <Button
            label={`\u2039 ${previousStep.number}. ${previousStep.label}`}
            variant="secondary"
            isDisabled={isSubmitting}
            onClick={onPrevious}
          />
        ) : (
          <Text type="supporting">
            Step {currentStep.number} of {STEPS.length}
          </Text>
        )}

        <Button
          type="submit"
          label={
            nextStep
              ? `${nextStep.number}. ${nextStep.label} \u203A`
              : PROGRESS_TEXT[stage]
          }
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
        />
      </Stack>
    </Stack>
  );
}
