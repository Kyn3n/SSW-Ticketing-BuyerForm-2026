import type { ReactNode } from "react";
import { Stack, Text } from "@astryxdesign/core";
import type { StepDefinition } from "@/lib/steps";
import { STEPS } from "@/lib/steps";
import { Eyebrow } from "./eyebrow";

type StepPanelProps = {
  step: StepDefinition;
  /** Which way the buyer travelled, so the panel slides in from that side. */
  direction: "forward" | "back";
  children: ReactNode;
};

/**
 * One step's contents. The caller remounts this on `key={step.id}`, which
 * restarts the entrance animation on every switch.
 */
export function StepPanel({ step, direction, children }: StepPanelProps) {
  return (
    <div
      className="ssw-step-panel"
      data-direction={direction}
      role="tabpanel"
      id={`ssw-panel-${step.id}`}
      aria-labelledby={`ssw-tab-${step.id}`}
      tabIndex={-1}
    >
      <Stack direction="vertical" gap={6}>
        <Stack direction="vertical" gap={2}>
          <Eyebrow>
            Step {step.number} of {STEPS.length}
          </Eyebrow>
          <Text type="display-3" as="h2">
            {step.title}
          </Text>
          <Text type="body" color="secondary">
            {step.description}
          </Text>
        </Stack>

        {children}
      </Stack>
    </div>
  );
}
