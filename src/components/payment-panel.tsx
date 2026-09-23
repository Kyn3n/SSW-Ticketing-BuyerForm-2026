import { Stack } from "@astryxdesign/core";
import { BankTransferDetails } from "./bank-transfer-details";
import { ReceiptDropzone } from "./receipt-dropzone";

type PaymentPanelProps = {
  receipt: File | null;
  receiptError: string | null;
  isDisabled: boolean;
  onReceiptChange: (receipt: File | null) => void;
  onReceiptError: (message: string) => void;
};

/** Payment instructions, then the receipt dropzone across the full width. */
export function PaymentPanel({
  receipt,
  receiptError,
  isDisabled,
  onReceiptChange,
  onReceiptError,
}: PaymentPanelProps) {
  return (
    <Stack direction="vertical" gap={5} as="section">
      <BankTransferDetails />

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
