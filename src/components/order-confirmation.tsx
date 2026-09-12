import { Button, Card, Divider, Stack, Text } from "@astryxdesign/core";
import type { CompletedOrder } from "@/lib/orders";
import {
  formatMyr,
  pluralizeBundles,
  pluralizeTickets,
  TICKET_TYPES,
  type TicketLine,
  type TicketType,
} from "@/lib/tickets";
import { Eyebrow } from "./eyebrow";
import { SuccessTick } from "./success-tick";

type OrderConfirmationProps = {
  order: CompletedOrder;
  onStartAnother: () => void;
};

/** Shown in place of the stepper once the order is with the review team. */
export function OrderConfirmation({
  order,
  onStartAnother,
}: OrderConfirmationProps) {
  const lines = (
    Object.entries(order.ticketSelections) as [TicketType, TicketLine][]
  ).filter(([, line]) => line.seatCount > 0);

  return (
    <Stack
      direction="vertical"
      hAlign="center"
      vAlign="center"
      minHeight="100dvh"
      padding={5}
    >
      <Card width="100%" maxWidth={580} padding={8} elevation="high">
        <Stack direction="vertical" gap={6} hAlign="center">
          <SuccessTick />

          <Stack direction="vertical" gap={3} hAlign="center">
            <Eyebrow>Order received</Eyebrow>
            <Text type="display-2" as="h1" justify="center">
              Payment under review
            </Text>
            <Text type="body" color="secondary" justify="center">
              We have your order and your receipt. Your tickets are emailed as
              soon as our team has verified the payment.
            </Text>
          </Stack>

          <Stack direction="vertical" gap={5} width="100%">
            <Divider />

            <Stack direction="horizontal" justify="between" gap={4}>
              <Text type="supporting">Order reference</Text>
              <Text type="body" weight="semibold" color="accent" hasTabularNumbers>
                {order.reference}
              </Text>
            </Stack>

            <Divider />

            <Stack direction="horizontal" justify="between" gap={4}>
              <Text type="supporting">Status</Text>
              <Text type="body" weight="semibold">
                Pending review
              </Text>
            </Stack>

            <Divider />

            <Stack direction="vertical" gap={3}>
              <Text type="supporting">Ticket breakdown</Text>
              {lines.map(([type, line]) => (
                <Stack key={type} direction="horizontal" justify="between" gap={4}>
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

            <Stack direction="horizontal" justify="between" vAlign="center" gap={4}>
              <Text type="supporting">Amount submitted</Text>
              <Text type="large" weight="bold" color="accent" hasTabularNumbers>
                {formatMyr(order.amount)}
              </Text>
            </Stack>
          </Stack>

          <Button
            label="Submit another order"
            variant="secondary"
            onClick={onStartAnother}
          />
        </Stack>
      </Card>
    </Stack>
  );
}
