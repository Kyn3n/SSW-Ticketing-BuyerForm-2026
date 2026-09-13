import { Card, Divider, FileInput, Grid, Stack, Text } from "@astryxdesign/core";
import { toStatus } from "@/lib/buyer-validation";
import { formatMyr, pluralizeBundles, pluralizeTickets } from "@/data/mappers/helper";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE, type BuyerDetails } from "@/types/order";
import {
  TICKET_TYPE_KEYS,
  TICKET_TYPES,
  type TicketLine,
  type TicketType,
} from "@/types/ticket";
import { Eyebrow } from "./eyebrow";
import { PaymentQr } from "./payment-qr";

type PaymentStepProps = {
  buyerDetails: BuyerDetails;
  ticketLines: Record<TicketType, TicketLine>;
  seatCount: number;
  total: number;
  receipt: File | null;
  receiptError: string | null;
  isDisabled: boolean;
  onReceiptChange: (receipt: File | null) => void;
};

/** Step 4: what is being bought, what it costs, and proof that it was paid. */
export function PaymentStep({
  buyerDetails,
  ticketLines,
  seatCount,
  total,
  receipt,
  receiptError,
  isDisabled,
  onReceiptChange,
}: PaymentStepProps) {
  const paidLines = TICKET_TYPE_KEYS.filter(
    (type) => ticketLines[type].seatCount > 0,
  );

  return (
    <Stack direction="vertical" gap={6}>
      <Stack direction="vertical" gap={4}>
        <Eyebrow>Order summary</Eyebrow>

        <Card variant="muted" padding={5}>
          <Stack direction="vertical" gap={4}>
            {paidLines.map((type) => {
              const line = ticketLines[type];

              return (
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
              );
            })}

            <Divider />

            <Stack direction="horizontal" justify="between" gap={4}>
              <Text type="supporting">Issued to</Text>
              <Stack direction="vertical" gap={0.5} hAlign="end">
                <Text type="body" weight="semibold">
                  {buyerDetails.name}
                </Text>
                <Text type="supporting">{buyerDetails.email}</Text>
              </Stack>
            </Stack>

            <Divider />

            <Stack direction="horizontal" justify="between" vAlign="center" gap={4}>
              <Text type="supporting">
                {seatCount} {pluralizeTickets(seatCount)} &middot; amount due
              </Text>
              <Text type="display-3" color="accent" hasTabularNumbers>
                {formatMyr(total)}
              </Text>
            </Stack>
          </Stack>
        </Card>
      </Stack>

      <Stack direction="vertical" gap={4}>
        <Eyebrow>Payment</Eyebrow>
        <Text type="body" color="secondary">
          Transfer exactly {formatMyr(total)} using the QR below, then drop the
          receipt in — screenshot or photo, whichever your bank gives you.
        </Text>

        <Grid columns={{ minWidth: 240, max: 2 }} gap={4}>
          <PaymentQr />
          <FileInput
            label="Payment receipt"
            isLabelHidden
            description="Drag and drop, or browse · JPG, PNG, WebP · Max 5 MB"
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

      <Text type="supporting">
        Your order stays pending until the payment has been verified by hand.
        Tickets and the invoice are then sent to {buyerDetails.email || "your email"}.
      </Text>
    </Stack>
  );
}
