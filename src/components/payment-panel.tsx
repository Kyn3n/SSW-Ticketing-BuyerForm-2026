import { Stack, Text } from "@astryxdesign/core";
import { formatMyr } from "@/data/mappers/helper";
import { Eyebrow } from "./eyebrow";
import { PaymentQr } from "./payment-qr";
import { ReceiptDropzone } from "./receipt-dropzone";

type PaymentPanelProps = {
  total: number;
  receipt: File | null;
  receiptError: string | null;
  isDisabled: boolean;
  onReceiptChange: (receipt: File | null) => void;
  onReceiptError: (message: string) => void;
};

/** Payment instructions, then the receipt dropzone across the full width. */
export function PaymentPanel({
  total,
  receipt,
  receiptError,
  isDisabled,
  onReceiptChange,
  onReceiptError,
}: PaymentPanelProps) {
  return (
    <Stack direction="vertical" gap={5} as="section">
      <Stack
        direction="horizontal"
        justify="between"
        vAlign="end"
        wrap="wrap"
        gap={3}
      >
        <Stack direction="vertical" gap={1}>
          <Eyebrow>Payment</Eyebrow>
          <Text type="large" weight="semibold" as="h3">
            Bank transfer receipt
          </Text>
        </Stack>
        <Stack direction="vertical" gap={0.5} hAlign="end">
          <Text type="supporting" justify="end">
            Amount due
          </Text>
          <Text type="large" weight="bold" color="accent" hasTabularNumbers>
            {formatMyr(total)}
          </Text>
        </Stack>
      </Stack>

      <PaymentQr />

      <ReceiptDropzone
        receipt={receipt}
        error={receiptError}
        isDisabled={isDisabled}
        onChange={onReceiptChange}
        onError={onReceiptError}
      />
    </Stack>
  );
}
