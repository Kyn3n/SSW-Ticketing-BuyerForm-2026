"use client";

import type { KeyboardEvent } from "react";
import { Text } from "@astryxdesign/core";
import { STEPS, type StepId } from "@/lib/steps";

type StepTabsProps = {
  activeStep: StepId;
  completed: Set<StepId>;
  /** Index of the furthest step unlocked so far; later tabs stay disabled. */
  furthestVisited: number;
  onSelect: (id: StepId) => void;
};

/**
 * Folder-style tabs across the top of the order panel. The active tab drops
 * its bottom border onto the panel, so it reads as the open folder.
 *
 * A real tablist: arrow keys walk between the tabs the buyer has unlocked.
 */
export function StepTabs({
  activeStep,
  completed,
  furthestVisited,
  onSelect,
}: StepTabsProps) {
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const delta =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;

    const current = STEPS.findIndex((step) => step.id === activeStep);
    const target = current + delta;
    if (target < 0 || target > furthestVisited) return;

    event.preventDefault();
    onSelect(STEPS[target].id);
  }

  return (
    <div
      className="ssw-tabs"
      role="tablist"
      aria-label="Order steps"
      onKeyDown={onKeyDown}
    >
      {STEPS.map((step, index) => {
        const isActive = step.id === activeStep;
        const isReachable = index <= furthestVisited;
        const isComplete = completed.has(step.id) && !isActive;

        return (
          <button
            key={step.id}
            type="button"
            role="tab"
            id={`ssw-tab-${step.id}`}
            aria-selected={isActive}
            aria-controls={`ssw-panel-${step.id}`}
            tabIndex={isActive ? 0 : -1}
            disabled={!isReachable}
            className="ssw-tab"
            data-active={isActive || undefined}
            data-complete={isComplete || undefined}
            onClick={() => onSelect(step.id)}
          >
            <span className="ssw-tab__number" aria-hidden="true">
              {isComplete ? "\u2713" : step.number}
            </span>
            <Text type="label" color="inherit">
              {step.label}
            </Text>
          </button>
        );
      })}
    </div>
  );
}
