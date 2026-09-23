import { Stack, Text } from "@astryxdesign/core";
import { Eyebrow } from "./eyebrow";

/** The buyer-facing policy shown immediately before order submission. */
export function RefundPolicy() {
  return (
    <Stack
      direction="vertical"
      gap={2}
      className="ssw-refund-policy"
      as="section"
      aria-labelledby="refund-policy-heading"
    >
      <Eyebrow>Before you submit</Eyebrow>
      <Text type="large" weight="semibold" as="h3" id="refund-policy-heading">
        Ticket refund and inventory policy
      </Text>
      <Stack direction="vertical" gap={1.5}>
        <Text type="supporting">
          Ticket purchases are non-refundable once payment has been validated
          and confirmed by the administrator.
        </Text>
        <Text type="supporting">
          If the number of tickets submitted exceeds the available inventory
          recorded in the ticketing system, the administrator may contact the
          affected buyer to discuss the available refund arrangements. Any
          refund in this situation will be handled manually by the
          administrator.
        </Text>
        <Text type="supporting">
          For questions about ticket availability, payment validation, refunds,
          or your order, please contact the PIC listed on this page.
        </Text>
        <Text type="supporting">
          By submitting an order, you confirm that you have read and understood
          this policy.
        </Text>
      </Stack>
    </Stack>
  );
}
