import { Stack, Text } from "@astryxdesign/core";
import { Eyebrow } from "./eyebrow";

/** Static bank details buyers should use when making the payment transfer. */
export function BankTransferDetails() {
  return (
    <Stack
      direction="vertical"
      gap={3}
      className="ssw-bank-details"
      as="section"
      aria-labelledby="bank-transfer-details-heading"
    >
      <Stack direction="vertical" gap={1}>
        <Eyebrow>Bank transfer</Eyebrow>
        <Text type="large" weight="semibold" as="h3" id="bank-transfer-details-heading">
          Transfer to this account
        </Text>
      </Stack>

      <Stack direction="vertical" gap={2}>
        <Stack direction="vertical" gap={0.5}>
          <Text type="supporting" color="secondary">
            Account name
          </Text>
          <Text type="body" weight="semibold">
            PERSATUAN SINFONI ORKESTRA SELANGOR
          </Text>
        </Stack>
        <Stack direction="vertical" gap={0.5}>
          <Text type="supporting" color="secondary">
            Bank
          </Text>
          <Text type="body" weight="semibold">
            PUBLIC BANK
          </Text>
        </Stack>
        <Stack direction="vertical" gap={0.5}>
          <Text type="supporting" color="secondary">
            Account number
          </Text>
          <Text type="large" weight="bold" color="accent" hasTabularNumbers>
            3249469506
          </Text>
        </Stack>
      </Stack>

      <Text type="supporting">
        Upload your payment receipt below after completing the transfer.
      </Text>
    </Stack>
  );
}
