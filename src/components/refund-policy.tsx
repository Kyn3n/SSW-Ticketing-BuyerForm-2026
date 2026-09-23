import { CheckboxInput, Stack, Text } from "@astryxdesign/core";
import { Eyebrow } from "./eyebrow";

type RefundPolicyProps = {
  isAcknowledged: boolean;
  hasError: boolean;
  onAcknowledgementChange: (isAcknowledged: boolean) => void;
};

/** The buyer-facing policy shown immediately before order submission. */
export function RefundPolicy({
  isAcknowledged,
  hasError,
  onAcknowledgementChange,
}: RefundPolicyProps) {
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
          Please acknowledge this policy before submitting your order.
        </Text>
      </Stack>

      <CheckboxInput
        label="I have read and understood the ticket refund and inventory policy."
        value={isAcknowledged}
        size="sm"
        className="ssw-refund-policy__checkbox"
        htmlName="refund-policy-acknowledgement"
        status={
          hasError
            ? {
                type: "error",
                message: "Acknowledge this policy before submitting your order.",
              }
            : undefined
        }
        onChange={onAcknowledgementChange}
      />
    </Stack>
  );
}
