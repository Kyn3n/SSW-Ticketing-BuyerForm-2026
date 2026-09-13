import { FileInput, Grid, Stack, Text } from "@astryxdesign/core";
import { toStatus } from "@/lib/buyer-validation";
import { formatMyr } from "@/data/mappers/helper";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from "@/types/order";
import { Eyebrow } from "./eyebrow";
import { PaymentQr } from "./payment-qr";

type PaymentPanelProps = {
  total: number;
  receipt: File | null;
  receiptError: string | null;
  isDisabled: boolean;
  onReceiptChange: (receipt: File | null) => void;
};

/** Payment instructions on the left, receipt dropzone on the right. */
export function PaymentPanel({
  total,
  receipt,
  receiptError,
  isDisabled,
  onReceiptChange,
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

      <Grid columns={{ minWidth: 240, max: 2 }} gap={4}>
        <PaymentQr />
        <FileInput
          label="Payment receipt"
          isLabelHidden
          description="JPG, PNG, or WebP · Max 5 MB"
          mode="dropzone"
          accept={ACCEPTED_FILE_TYPES}
          maxSize={MAX_FILE_SIZE}
          isRequired
          isDisabled={isDisabled}
          value={receipt}
          status={toStatus(receiptError)}
          onChange={(files) =>
            onReceiptChange(Array.isArray(files) ? (files[0] ?? null) : files)
          }
        />
      </Grid>
    </Stack>
  );
}
