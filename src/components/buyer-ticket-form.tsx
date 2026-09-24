"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Banner, Button, Card, Stack, Text } from "@astryxdesign/core";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  validateBuyerDetails,
  type BuyerFieldErrors,
} from "@/lib/buyer-validation";
import { InsufficientCapacityError, submitOrder } from "@/services/api";
import { usePackagePrices } from "@/hooks/use-package-prices";
import {
  computePaymentSum,
  formatShortfallMessage,
  sumSeats,
  sumTotal,
  toCartPayload,
  toPackagePriceMap,
  toSavingsOpportunities,
  toTicketLines,
  toTicketPricing,
  withBundleSavingsApplied,
} from "@/data/mappers/helper";
import type {
  BuyerDetails,
  CompletedOrder,
  SeatsRemaining,
  TicketTypeShortfall,
} from "@/types/order";
import {
  BUNDLE_SIZE,
  INITIAL_TICKET_SELECTIONS,
  TICKET_TYPE_KEYS,
  type TicketCounts,
  type TicketSelections,
  type TicketType,
} from "@/types/ticket";
import { BrandHeader } from "./brand-header";
import { BuyerDetailsFields } from "./buyer-details-fields";
import { EventPanel } from "./event-panel";
import { Eyebrow } from "./eyebrow";
import { HeroParallax, HERO_HEIGHT, HERO_OVERLAP } from "./hero-parallax";
import { OrderFormSkeleton } from "./order-form-skeleton";
import { OrderSuccess } from "./order-success";
import { PaymentPanel } from "./payment-panel";
import { RefundPolicy } from "./refund-policy";
import { SavingsDialog } from "./savings-dialog";
import { SoldOutNotice } from "./sold-out-notice";
import { SubmitBar } from "./submit-bar";
import { TicketSelection } from "./ticket-selection";

const EMPTY_BUYER_DETAILS: BuyerDetails = { name: "", email: "", phone: "" };
const PANEL_MAX_WIDTH = 1024;
type CheckoutStep = "details" | "payment";

const CHECKOUT_STEP_VARIANTS = {
  hidden: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction * 16,
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction * -16,
    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] as const },
  }),
};

export function BuyerTicketForm() {
  const shouldReduceMotion = useReducedMotion();
  const [buyerDetails, setBuyerDetails] =
    useState<BuyerDetails>(EMPTY_BUYER_DETAILS);
  const [fieldErrors, setFieldErrors] = useState<BuyerFieldErrors>({});
  const [ticketSelections, setTicketSelections] = useState<TicketSelections>(
    INITIAL_TICKET_SELECTIONS,
  );
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [refundPolicyAcknowledged, setRefundPolicyAcknowledged] =
    useState(false);
  const [refundPolicyError, setRefundPolicyError] = useState(false);
  const [seatCountError, setSeatCountError] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("details");
  const [stepDirection, setStepDirection] = useState<1 | -1>(1);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSavingsConfirmation, setShowSavingsConfirmation] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(
    null,
  );

  const {
    prices,
    seatsRemaining,
    isLoading: pricesLoading,
    error: pricesError,
    retry: retryPrices,
    refresh: refreshPrices,
  } = usePackagePrices();
  const packagePriceMap = useMemo(
    () => toPackagePriceMap(prices ?? []),
    [prices],
  );
  const ticketPricing = useMemo(
    () => toTicketPricing(packagePriceMap),
    [packagePriceMap],
  );

  const ticketLines = useMemo(
    () => toTicketLines(ticketSelections, ticketPricing),
    [ticketSelections, ticketPricing],
  );
  const savingsOpportunities = useMemo(
    () => toSavingsOpportunities(ticketSelections, ticketPricing),
    [ticketSelections, ticketPricing],
  );
  const seatCount = sumSeats(ticketLines);
  const total = sumTotal(ticketLines);
  const availableSavings =
    savingsOpportunities.normal.savings + savingsOpportunities.vip.savings;
  const isSoldOut = seatsRemaining.normal <= 0 && seatsRemaining.vip <= 0;

  function updateTicketCount(
    type: TicketType,
    field: keyof TicketCounts,
    value: number,
  ) {
    setTicketSelections((current) => ({
      ...current,
      [type]: { ...current[type], [field]: Math.max(0, value) },
    }));
    setSeatCountError(false);
  }

  function updateBuyerField(field: keyof BuyerDetails, value: string) {
    setBuyerDetails((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function resetForm() {
    setCompletedOrder(null);
    setBuyerDetails(EMPTY_BUYER_DETAILS);
    setTicketSelections(INITIAL_TICKET_SELECTIONS);
    setReceipt(null);
    setReceiptError(null);
    setRefundPolicyAcknowledged(false);
    setRefundPolicyError(false);
    setSeatCountError(false);
    setCheckoutStep("details");
    setStepDirection(1);
    setIsCheckingAvailability(false);
    setFieldErrors({});
    setFormError(null);
    // Availability and prices may have moved on while the buyer was
    // reviewing their receipt — bring the next order in fresh.
    void refreshPrices().catch(() => undefined);
  }

  async function sendOrder() {
    if (!receipt) {
      setReceiptError("Add your payment receipt before submitting.");
      return;
    }

    const paymentSum = computePaymentSum(
      toCartPayload(ticketSelections),
      packagePriceMap,
    );

    setIsSubmitting(true);
    try {
      const order = await submitOrder({
        buyerDetails,
        ticketSelections,
        ticketLines,
        total,
        paymentSum,
        receipt,
      });
      setCompletedOrder(order);
    } catch (error) {
      if (error instanceof InsufficientCapacityError) {
        // Availability just changed underneath the buyer — refresh and
        // reconcile so any now-sold-out type's counts drop back to 0
        // instead of leaving the buyer to retry blind with a stale cart.
        try {
          const fresh = await refreshPrices();
          reconcileSelections(fresh.seatsRemaining);
        } catch {
          // Keep the shortfall message below even if the refresh itself fails.
        }
        setFormError(formatShortfallMessage(error.ticketTypes));
      } else {
        setFormError(
          error instanceof Error ? error.message : "Unable to submit your order.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function reconcileSelections(nextSeatsRemaining: SeatsRemaining) {
    const shortfalls: TicketTypeShortfall[] = [];
    const nextSelections = { ...ticketSelections };

    for (const type of TICKET_TYPE_KEYS) {
      const current = ticketSelections[type];
      const requestedSeats =
        current.singleCount + current.bundleCount * BUNDLE_SIZE;
      const availableSeats = Math.max(0, nextSeatsRemaining[type]);

      if (requestedSeats > availableSeats) {
        shortfalls.push({
          ticketType: type.toUpperCase() as TicketTypeShortfall["ticketType"],
          requestedSeats,
          availableSeats,
          sufficient: false,
        });
      }

      const singleCount = Math.min(current.singleCount, availableSeats);
      const bundleCount = Math.min(
        current.bundleCount,
        Math.floor(Math.max(0, availableSeats - singleCount) / BUNDLE_SIZE),
      );
      nextSelections[type] = { singleCount, bundleCount };
    }

    setTicketSelections(nextSelections);
    return shortfalls;
  }

  async function checkAvailabilityAndContinue() {
    setFormError(null);
    setIsCheckingAvailability(true);

    try {
      const fresh = await refreshPrices();
      const shortfalls = reconcileSelections(fresh.seatsRemaining);
      if (shortfalls.length > 0) {
        setFormError(formatShortfallMessage(shortfalls));
        return;
      }

      if (availableSavings > 0) {
        setShowSavingsConfirmation(true);
      } else {
        setStepDirection(1);
        setCheckoutStep("payment");
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to check ticket availability. Please try again.",
      );
    } finally {
      setIsCheckingAvailability(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The submit button stays interactive while it morphs through its stages,
    // so a second submit (Enter, or a stray click) has to be refused here.
    if (isSubmitting) return;
    setFormError(null);
    setSeatCountError(false);

    if (checkoutStep === "payment") {
      if (!receipt) {
        setReceiptError("Add your payment receipt before submitting.");
        return;
      }

      void sendOrder();
      return;
    }

    const errors = validateBuyerDetails(buyerDetails);
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    if (seatCount === 0) {
      setSeatCountError(true);
      return;
    }

    if (!refundPolicyAcknowledged) {
      setRefundPolicyError(true);
      return;
    }

    if (pricesLoading || pricesError) {
      setFormError(
        "Ticket prices are still loading. Please wait a moment and try again.",
      );
      return;
    }

    void checkAvailabilityAndContinue();
  }

  function applyBundleSavings() {
    setTicketSelections(withBundleSavingsApplied);
    setShowSavingsConfirmation(false);
    setStepDirection(1);
    setCheckoutStep("payment");
  }

  function continueWithoutSavings() {
    setShowSavingsConfirmation(false);
    setStepDirection(1);
    setCheckoutStep("payment");
  }

  function returnToDetails() {
    setStepDirection(-1);
    setCheckoutStep("details");
    setReceipt(null);
    setReceiptError(null);
    setFormError(null);
  }

  return (
    <main className="ssw-page">
      <HeroParallax />

      <div className="ssw-scroller">
        <Stack
          direction="vertical"
          hAlign="center"
          justify="start"
          paddingInline={5}
          paddingBlock={6}
          style={{ minHeight: HERO_HEIGHT - HERO_OVERLAP }}
        >
        </Stack>

        <div className="ssw-sheet">
          <Stack direction="vertical" hAlign="center">
            <div className="ssw-sheet__header">
              <BrandHeader />
            </div>
            <Card
              padding={0}
              width="100%"
              maxWidth={PANEL_MAX_WIDTH}
              elevation="high"
              style={{ overflow: "hidden" }}
            >
              {completedOrder ? (
                <OrderSuccess
                  order={completedOrder}
                  onStartAnother={resetForm}
                />
              ) : (
                <div className="ssw-panel-grid">
                  <EventPanel />

                  <Stack direction="vertical" gap={6} padding={8} as="section">
                    {pricesLoading ? (
                      <OrderFormSkeleton />
                    ) : isSoldOut ? (
                      <SoldOutNotice />
                    ) : (
                      <>
                        <Stack direction="vertical" gap={1}>
                          <Eyebrow>
                            {checkoutStep === "details" ? "Ticket order" : "Payment"}
                          </Eyebrow>
                          <Text type="display-3" as="h2">
                            {checkoutStep === "details"
                              ? "Buyer details"
                              : "Complete your payment"}
                          </Text>
                        </Stack>

                        <form onSubmit={handleSubmit} noValidate>
                          <Stack direction="vertical" gap={6}>
                            {pricesError && (
                              <Banner
                                status="error"
                                title="Unable to load ticket prices"
                                description={pricesError}
                                endContent={
                                  <Button
                                    label="Retry"
                                    variant="secondary"
                                    size="sm"
                                    onClick={retryPrices}
                                  />
                                }
                              />
                            )}

                            <AnimatePresence
                              mode="wait"
                              initial={false}
                              custom={stepDirection}
                            >
                              <motion.div
                                key={checkoutStep}
                                className="ssw-checkout-step"
                                custom={stepDirection}
                                variants={CHECKOUT_STEP_VARIANTS}
                                initial={shouldReduceMotion ? false : "hidden"}
                                animate="visible"
                                exit={shouldReduceMotion ? undefined : "exit"}
                              >
                                {checkoutStep === "details" ? (
                                  <>
                                <TicketSelection
                                  ticketLines={ticketLines}
                                  savingsOpportunities={savingsOpportunities}
                                  pricing={ticketPricing}
                                  seatsRemaining={seatsRemaining}
                                  seatCount={seatCount}
                                  total={total}
                                  isDisabled={isSubmitting || isCheckingAvailability}
                                  hasSeatCountError={seatCountError}
                                  onCountChange={updateTicketCount}
                                />

                                <BuyerDetailsFields
                                  values={buyerDetails}
                                  errors={fieldErrors}
                                  isDisabled={isSubmitting || isCheckingAvailability}
                                  onChange={updateBuyerField}
                                />

                                <RefundPolicy
                                  isAcknowledged={refundPolicyAcknowledged}
                                  hasError={refundPolicyError}
                                  onAcknowledgementChange={(isAcknowledged) => {
                                    setRefundPolicyAcknowledged(isAcknowledged);
                                    setRefundPolicyError(false);
                                  }}
                                />

                                <SubmitBar
                                  total={total}
                                  isSubmitting={isSubmitting}
                                  mode="details"
                                  isCheckingAvailability={isCheckingAvailability}
                                />
                                  </>
                                ) : (
                                  <>
                                <PaymentPanel
                                  receipt={receipt}
                                  receiptError={receiptError}
                                  isDisabled={isSubmitting}
                                  onReceiptChange={(file) => {
                                    setReceiptError(null);
                                    setReceipt(file);
                                  }}
                                  onReceiptError={setReceiptError}
                                />

                                <SubmitBar
                                  total={total}
                                  isSubmitting={isSubmitting}
                                  onBack={returnToDetails}
                                />
                                  </>
                                )}
                              </motion.div>
                            </AnimatePresence>

                            {formError && (
                              <Banner
                                status="error"
                                title="Unable to submit"
                                description={formError}
                              />
                            )}

                            <Text type="supporting">
                              Your order remains pending until the payment has
                              been manually verified. Tickets and the invoice
                              will be sent by email.
                            </Text>
                          </Stack>
                        </form>
                      </>
                    )}
                  </Stack>
                </div>
              )}
            </Card>
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
