"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Banner, Card, Section, Stack, Text } from "@astryxdesign/core";
import {
  validateBuyerDetails,
  type BuyerFieldErrors,
} from "@/lib/buyer-validation";
import { submitOrder } from "@/services/api";
import {
  sumSeats,
  sumTotal,
  toSavingsOpportunities,
  toTicketLines,
  withBundleSavingsApplied,
} from "@/data/mappers/helper";
import type { BuyerDetails, CompletedOrder, SubmissionStage } from "@/types/order";
import {
  INITIAL_TICKET_SELECTIONS,
  type TicketCounts,
  type TicketSelections,
  type TicketType,
} from "@/types/ticket";
import { BrandHeader } from "./brand-header";
import { BuyerDetailsFields } from "./buyer-details-fields";
import { EventPanel } from "./event-panel";
import { Eyebrow } from "./eyebrow";
import { HeroParallax, HERO_HEIGHT, HERO_OVERLAP } from "./hero-parallax";
import { OrderConfirmation } from "./order-confirmation";
import { PaymentPanel } from "./payment-panel";
import { SavingsDialog } from "./savings-dialog";
import { SubmitBar } from "./submit-bar";
import { TicketSelection } from "./ticket-selection";

const EMPTY_BUYER_DETAILS: BuyerDetails = { name: "", email: "", phone: "" };
const PANEL_MAX_WIDTH = 1024;

export function BuyerTicketForm() {
  const [buyerDetails, setBuyerDetails] =
    useState<BuyerDetails>(EMPTY_BUYER_DETAILS);
  const [fieldErrors, setFieldErrors] = useState<BuyerFieldErrors>({});
  const [ticketSelections, setTicketSelections] = useState<TicketSelections>(
    INITIAL_TICKET_SELECTIONS,
  );
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
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

  function updateTicketCount(
    type: TicketType,
    field: keyof TicketCounts,
    value: number,
  ) {
    setTicketSelections((current) => ({
      ...current,
      [type]: { ...current[type], [field]: Math.max(0, value) },
    }));
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
    setFieldErrors({});
    setFormError(null);
  }

  async function sendOrder() {
    if (!receipt) {
      setReceiptError("Add your payment receipt before submitting.");
      return;
    }

    try {
      const order = await submitOrder({
        buyerDetails,
        ticketSelections,
        receipt,
        onStageChange: setStage,
      });
      setCompletedOrder(order);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to submit your order.",
      );
    } finally {
      setStage("idle");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const errors = validateBuyerDetails(buyerDetails);
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    if (!receipt) {
      setReceiptError("Add your payment receipt before submitting.");
      return;
    }

    // Offer the cheaper equivalent basket before taking the payment.
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
          <BrandHeader />
        </Stack>

        <div className="ssw-sheet">
          <Stack direction="vertical" hAlign="center">
            <Card
              padding={0}
              width="100%"
              maxWidth={PANEL_MAX_WIDTH}
              elevation="high"
              style={{ overflow: "hidden" }}
            >
              <div className="ssw-panel-grid">
                <EventPanel />

                <Stack direction="vertical" gap={6} padding={8} as="section">
                  <Stack direction="vertical" gap={1}>
                    <Eyebrow>Ticket order</Eyebrow>
                    <Text type="display-3" as="h2">
                      Buyer details
                    </Text>
                  </Stack>

                  <form onSubmit={handleSubmit} noValidate>
                    <Stack direction="vertical" gap={6}>
                      <TicketSelection
                        ticketLines={ticketLines}
                        savingsOpportunities={savingsOpportunities}
                        seatCount={seatCount}
                        total={total}
                        isDisabled={isSubmitting}
                        onCountChange={updateTicketCount}
                      />

                      <BuyerDetailsFields
                        values={buyerDetails}
                        errors={fieldErrors}
                        isDisabled={isSubmitting}
                        onChange={updateBuyerField}
                      />

                      <PaymentPanel
                        total={total}
                        receipt={receipt}
                        receiptError={receiptError}
                        isDisabled={isSubmitting}
                        onReceiptChange={(file) => {
                          setReceiptError(null);
                          setReceipt(file);
                        }}
                      />

                      <SubmitBar total={total} stage={stage} />

                      {formError && (
                        <Banner
                          status="error"
                          title="Unable to submit"
                          description={formError}
                        />
                      )}

                      <Text type="supporting">
                        Your order remains pending until the payment has been
                        manually verified. Tickets and the invoice will be sent
                        by email.
                      </Text>
                    </Stack>
                  </form>
                </Stack>
              </div>
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
