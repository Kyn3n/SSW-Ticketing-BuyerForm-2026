"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Button, Divider, Stack, Text } from "@astryxdesign/core";
import {
  formatMyr,
  pluralizeBundles,
  pluralizeTickets,
} from "@/data/mappers/helper";
import type { CompletedOrder } from "@/types/order";
import { TICKET_TYPES, type TicketLine, type TicketType } from "@/types/ticket";
import { Eyebrow } from "./eyebrow";
import { SuccessCheck } from "./success-check";

/** How long the buyer should expect to wait before the tickets arrive. */
const PROCESSING_DAYS = 3;

type OrderSuccessProps = {
  order: CompletedOrder;
  onStartAnother: () => void;
};

const CONTAINER: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.25, staggerChildren: 0.07 } },
};

const ITEM: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

/** A labelled row of the order summary. */
function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Stack direction="horizontal" justify="between" vAlign="center" gap={4}>
      <Text type="supporting">{label}</Text>
      {children}
    </Stack>
  );
}

/**
 * Replaces the event panel and the order form once the order is in. The buyer
 * has nothing left to do here, so the whole card becomes the receipt of what
 * they submitted rather than a dialog stacked on top of a form they can no
 * longer use.
 */
export function OrderSuccess({ order, onStartAnother }: OrderSuccessProps) {
  const shouldReduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  // The submit button sits far down a long form, so the panel that replaces
  // it would otherwise appear off-screen.
  useEffect(() => {
    rootRef.current?.scrollIntoView({
      block: "start",
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  }, [shouldReduceMotion]);

  const lines = (
    Object.entries(order.ticketSelections) as [TicketType, TicketLine][]
  ).filter(([, line]) => line.seatCount > 0);

  return (
    <motion.div
      ref={rootRef}
      className="ssw-success-panel"
      variants={CONTAINER}
      initial={shouldReduceMotion ? false : "hidden"}
      animate="visible"
    >
      <Stack direction="vertical" gap={6} hAlign="center" padding={8}>
        <SuccessCheck />

        <motion.div variants={ITEM}>
          <Stack direction="vertical" gap={3} hAlign="center">
            <Text type="display-3" as="h2" justify="center">
              Your response has been recorded
            </Text>
            <Text
              type="body"
              color="secondary"
              justify="center"
              className="ssw-success-panel__lede"
            >
              We have your order and your payment receipt. Once our team has
              verified the transfer — usually within {PROCESSING_DAYS} business
              days — your tickets and invoice will be issued and sent to{" "}
              <Text type="body" weight="semibold" color="primary">
                {order.email}
              </Text>
              . There is nothing else you need to do.
            </Text>
          </Stack>
        </motion.div>

        <motion.div variants={ITEM} className="ssw-success-panel__reference">
          <Stack direction="vertical" gap={1} hAlign="center" padding={4}>
            <Eyebrow>Order reference</Eyebrow>
            <Text
              type="display-3"
              weight="bold"
              color="accent"
              hasTabularNumbers
            >
              {order.reference}
            </Text>
            <Text type="supporting" justify="center">
              Quote this if you need to contact us about your order.
            </Text>
          </Stack>
        </motion.div>

        <motion.div variants={ITEM} className="ssw-success-panel__summary">
          <Stack direction="vertical" gap={5}>
            <Stack direction="vertical" gap={3}>
              <Text type="supporting" className="ssw-eyebrow">
                What you submitted
              </Text>

              {lines.map(([type, line]) => (
                <Stack
                  key={type}
                  direction="horizontal"
                  justify="between"
                  gap={4}
                >
                  <Stack direction="vertical" gap={0.5}>
                    <Text type="body" weight="semibold">
                      {TICKET_TYPES[type].label} &middot; {line.seatCount}{" "}
                      {pluralizeTickets(line.seatCount)}
                    </Text>
                    <Text type="supporting">
                      {line.singleCount} single, {line.bundleCount}{" "}
                      {pluralizeBundles(line.bundleCount)}
                    </Text>
                  </Stack>
                  <Text type="body" weight="semibold" hasTabularNumbers>
                    {formatMyr(line.subtotal)}
                  </Text>
                </Stack>
              ))}
            </Stack>

            <Divider />

            <SummaryRow label="Total tickets">
              <Text type="body" weight="semibold" hasTabularNumbers>
                {order.seatCount} {pluralizeTickets(order.seatCount)}
              </Text>
            </SummaryRow>

            <SummaryRow label="Status">
              <Text type="body" weight="semibold">
                Pending payment review
              </Text>
            </SummaryRow>

            <Divider />

            <SummaryRow label="Amount submitted">
              <Text type="large" weight="bold" color="accent" hasTabularNumbers>
                {formatMyr(order.amount)}
              </Text>
            </SummaryRow>
          </Stack>
        </motion.div>

        <motion.div variants={ITEM}>
          <Button
            label="Submit another order"
            variant="secondary"
            onClick={onStartAnother}
          />
        </motion.div>
      </Stack>
    </motion.div>
  );
}
