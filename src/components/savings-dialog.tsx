import {
  Button,
  Dialog,
  DialogHeader,
  Divider,
  LayoutContent,
  LayoutFooter,
  Stack,
  Text,
} from "@astryxdesign/core";
import { formatMyr, pluralizeBundles } from "@/data/mappers/helper";
import {
  TICKET_TYPE_KEYS,
  TICKET_TYPES,
  type SavingsOpportunity,
  type TicketType,
} from "@/types/ticket";

type SavingsDialogProps = {
  isOpen: boolean;
  availableSavings: number;
  savingsOpportunities: Record<TicketType, SavingsOpportunity>;
  onOpenChange: (isOpen: boolean) => void;
  onApply: () => void;
  onContinue: () => void;
};

/** Last-chance prompt before submitting an order that is leaving money on the table. */
export function SavingsDialog({
  isOpen,
  availableSavings,
  savingsOpportunities,
  onOpenChange,
  onApply,
  onContinue,
}: SavingsDialogProps) {
  const eligibleTypes = TICKET_TYPE_KEYS.filter(
    (type) => savingsOpportunities[type].bundleCount > 0,
  );

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} purpose="form" width={460}>
      <DialogHeader
        title={`Save ${formatMyr(availableSavings)}`}
        subtitle="Bundle savings available"
        onOpenChange={onOpenChange}
      />
      <LayoutContent>
        <Stack direction="vertical" gap={5}>
          <Text type="body" color="secondary">
            Keep the same number of tickets by switching eligible singles to
            bundle deals.
          </Text>

          <Divider />

          <Stack direction="vertical" gap={3}>
            {eligibleTypes.map((type) => {
              const savings = savingsOpportunities[type];

              return (
                <Stack key={type} direction="horizontal" justify="between" gap={4}>
                  <Text type="body" color="secondary">
                    {TICKET_TYPES[type].label}: switch {savings.singlesConverted}{" "}
                    singles to {savings.bundleCount}{" "}
                    {pluralizeBundles(savings.bundleCount)}
                  </Text>
                  <Text type="body" weight="semibold" color="accent">
                    Save {formatMyr(savings.savings)}
                  </Text>
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </LayoutContent>
      <LayoutFooter hasDivider>
        <Stack direction="horizontal" justify="end" gap={3} wrap="wrap">
          <Button label="Continue anyway" variant="secondary" onClick={onContinue} />
          <Button label="Use bundle savings" variant="primary" onClick={onApply} />
        </Stack>
      </LayoutFooter>
    </Dialog>
  );
}
