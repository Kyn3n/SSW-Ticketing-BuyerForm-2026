"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { Section, Stack, useToast } from "@astryxdesign/core";
import type { BuyerFieldErrors } from "@/lib/buyer-validation";
import {
  submitOrder,
  type BuyerDetails,
  type CompletedOrder,
  type SubmissionStage,
} from "@/lib/orders";
import {
  completedSteps,
  hasStepErrors,
  NO_STEP_ERRORS,
  stepIndex,
  STEPS,
  validateStep,
  type StepDraft,
  type StepErrors,
  type StepId,
} from "@/lib/steps";
import {
  INITIAL_TICKET_SELECTIONS,
  sumSeats,
  sumTotal,
  toSavingsOpportunities,
  toTicketLines,
  withBundleSavingsApplied,
  type TicketCounts,
  type TicketSelections,
  type TicketType,
} from "@/lib/tickets";
import { BrandHeader } from "./brand-header";
import { HeroParallax } from "./hero-parallax";
import { IntroStep } from "./intro-step";
import { OrderConfirmation } from "./order-confirmation";
import { PaymentStep } from "./payment-step";
import { PersonalInfoStep } from "./personal-info-step";
import { SavingsDialog } from "./savings-dialog";
import { SeatsStep } from "./seats-step";
import { StepNav } from "./step-nav";
import { StepPanel } from "./step-panel";
import { StepTabs } from "./step-tabs";
import { useScrollHandoff } from "./use-scroll-handoff";

const EMPTY_BUYER_DETAILS: BuyerDetails = { name: "", email: "", phone: "" };
const PANEL_MAX_WIDTH = 860;

export function BuyerTicketForm() {
  const showToast = useToast();
  const pageRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useScrollHandoff({ pageRef, heroRef, sheetRef, panelRef });

  const [activeStep, setActiveStep] = useState<StepId>("intro");
  const [furthestVisited, setFurthestVisited] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const [buyerDetails, setBuyerDetails] =
    useState<BuyerDetails>(EMPTY_BUYER_DETAILS);
  const [ticketSelections, setTicketSelections] = useState<TicketSelections>(
    INITIAL_TICKET_SELECTIONS,
  );
  const [receipt, setReceipt] = useState<File | null>(null);
  const [errors, setErrors] = useState<StepErrors>(NO_STEP_ERRORS);
  const [stage, setStage] = useState<SubmissionStage>("idle");
  const [showSavingsConfirmation, setShowSavingsConfirmation] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(
    null,
  );

  const ticketLines = useMemo(
    () => toTicketLines(ticketSelections),
    [ticketSelections],
  );
  const savingsOpportunities = useMemo(
    () => toSavingsOpportunities(ticketSelections),
    [ticketSelections],
  );
  const seatCount = sumSeats(ticketLines);
  const total = sumTotal(ticketLines);
  const availableSavings =
    savingsOpportunities.normal.savings + savingsOpportunities.vip.savings;
  const isSubmitting = stage !== "idle";

  const draft: StepDraft = { buyerDetails, seatCount, receipt };
  const currentIndex = stepIndex(activeStep);
  const currentStep = STEPS[currentIndex];
  const previousStep = STEPS[currentIndex - 1];
  const nextStep = STEPS[currentIndex + 1];
  const completed = useMemo(
    () => completedSteps({ buyerDetails, seatCount, receipt }),
    [buyerDetails, seatCount, receipt],
  );

  function goToStep(id: StepId, travel: "forward" | "back") {
    setDirection(travel);
    setActiveStep(id);
    setFurthestVisited((furthest) => Math.max(furthest, stepIndex(id)));
    // Bring the top of the panel back into view; the hero is tall enough that
    // a late step would otherwise open scrolled past its own heading.
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /**
   * Tabs are a shortcut, not a bypass: stepping back is always free, but
   * jumping ahead still has to clear the step you are standing on.
   */
  function handleTabSelect(id: StepId) {
    const target = stepIndex(id);
    if (target === currentIndex) return;

    if (target < currentIndex) {
      goToStep(id, "back");
      return;
    }

    const stepErrors = validateStep(activeStep, draft);
    setErrors(stepErrors);
    if (hasStepErrors(stepErrors)) return;

    goToStep(id, "forward");
  }

  function updateTicketCount(
    type: TicketType,
    field: keyof TicketCounts,
    value: number,
  ) {
    setTicketSelections((current) => ({
      ...current,
      [type]: { ...current[type], [field]: Math.max(0, value) },
    }));
    setErrors((current) => ({ ...current, seats: null }));
  }

  function updateBuyerField(field: keyof BuyerDetails, value: string) {
    setBuyerDetails((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      buyer: { ...current.buyer, [field]: undefined } as BuyerFieldErrors,
    }));
  }

  function resetForm() {
    setCompletedOrder(null);
    setBuyerDetails(EMPTY_BUYER_DETAILS);
    setTicketSelections(INITIAL_TICKET_SELECTIONS);
    setReceipt(null);
    setErrors(NO_STEP_ERRORS);
    setActiveStep("intro");
    setFurthestVisited(0);
    setDirection("forward");
  }

  async function sendOrder() {
    try {
      const order = await submitOrder({
        buyerDetails,
        ticketSelections,
        receipt: receipt as File,
        onStageChange: setStage,
      });
      setCompletedOrder(order);
    } catch (error) {
      // Everything the buyer typed stays exactly where it is — the toast is
      // the only thing that changes, so they can retry without re-entering.
      showToast({
        type: "error",
        body:
          error instanceof Error
            ? error.message
            : "Unable to submit your order. Please try again.",
        isAutoHide: false,
      });
    } finally {
      setStage("idle");
    }
  }

  /**
   * The nav's forward button is the form's submit button, so this runs on
   * every step: validate what this step owns, then either advance or submit.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const stepErrors = validateStep(activeStep, draft);
    setErrors(stepErrors);
    if (hasStepErrors(stepErrors)) return;

    if (nextStep) {
      goToStep(nextStep.id, "forward");
      return;
    }

    if (availableSavings > 0) {
      setShowSavingsConfirmation(true);
      return;
    }

    void sendOrder();
  }

  function applyBundleSavings() {
    setTicketSelections(withBundleSavingsApplied);
    setShowSavingsConfirmation(false);
  }

  function continueWithoutSavings() {
    setShowSavingsConfirmation(false);
    void sendOrder();
  }

  if (completedOrder) {
    return (
      <Section variant="transparent" minHeight="100dvh">
        <OrderConfirmation order={completedOrder} onStartAnother={resetForm} />
      </Section>
    );
  }

  return (
    <main className="ssw-page" ref={pageRef}>
      <HeroParallax ref={heroRef} />

      <div className="ssw-scroller">
        <Stack
          direction="vertical"
          hAlign="center"
          justify="start"
          paddingInline={5}
          paddingBlock={6}
          className="ssw-hero-spacer"
        >
          <BrandHeader />
        </Stack>

        <div className="ssw-sheet" ref={sheetRef}>
          <Stack direction="vertical" hAlign="center">
            <div
              ref={panelRef}
              className="ssw-folder"
              style={{ maxWidth: PANEL_MAX_WIDTH }}
            >
              <StepTabs
                activeStep={activeStep}
                completed={completed}
                furthestVisited={furthestVisited}
                onSelect={handleTabSelect}
              />

              {/*
                * Not an Astryx Card: the folder body has to share an exact
                * edge with the tabs sitting on it, and Card's StyleX border
                * and corners cannot be overridden from a stylesheet.
                */}
              <div className="ssw-folder__body">
                <form onSubmit={handleSubmit} noValidate>
                  <Stack direction="vertical" gap={6}>
                    <StepPanel
                      key={activeStep}
                      step={currentStep}
                      direction={direction}
                    >
                      {activeStep === "intro" && <IntroStep />}

                      {activeStep === "seats" && (
                        <SeatsStep
                          ticketLines={ticketLines}
                          savingsOpportunities={savingsOpportunities}
                          seatCount={seatCount}
                          total={total}
                          error={errors.seats}
                          isDisabled={isSubmitting}
                          onCountChange={updateTicketCount}
                        />
                      )}

                      {activeStep === "details" && (
                        <PersonalInfoStep
                          values={buyerDetails}
                          errors={errors.buyer}
                          isDisabled={isSubmitting}
                          onChange={updateBuyerField}
                        />
                      )}

                      {activeStep === "payment" && (
                        <PaymentStep
                          buyerDetails={buyerDetails}
                          ticketLines={ticketLines}
                          seatCount={seatCount}
                          total={total}
                          receipt={receipt}
                          receiptError={errors.receipt}
                          isDisabled={isSubmitting}
                          onReceiptChange={(file) => {
                            setReceipt(file);
                            setErrors((current) => ({ ...current, receipt: null }));
                          }}
                        />
                      )}
                    </StepPanel>

                    <StepNav
                      currentStep={currentStep}
                      previousStep={previousStep}
                      nextStep={nextStep}
                      stage={stage}
                      onPrevious={() =>
                        previousStep && goToStep(previousStep.id, "back")
                      }
                    />
                  </Stack>
                </form>
              </div>
            </div>
          </Stack>
        </div>
      </div>

      <SavingsDialog
        isOpen={showSavingsConfirmation}
        availableSavings={availableSavings}
        savingsOpportunities={savingsOpportunities}
        onOpenChange={setShowSavingsConfirmation}
        onApply={applyBundleSavings}
        onContinue={continueWithoutSavings}
      />
    </main>
  );
}
