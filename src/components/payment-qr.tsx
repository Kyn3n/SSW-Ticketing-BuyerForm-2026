import { Stack, Text } from "@astryxdesign/core";

const QR_CELLS = [0, 1, 3, 4, 6, 9, 10, 12, 14, 15];

/** Stand-in for the bank's payment QR until the real asset is wired up. */
export function PaymentQr() {
  return (
    <Stack
      direction="horizontal"
      vAlign="center"
      gap={4}
      padding={4}
      minHeight={144}
      style={{
        background: "var(--color-background-muted)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-container)",
      }}
    >
      <div className="ssw-qr" aria-hidden="true">
        {QR_CELLS.map((cell) => (
          <span
            key={cell}
            style={{
              gridArea: `${Math.floor(cell / 4) + 1} / ${(cell % 4) + 1}`,
            }}
          />
        ))}
      </div>
      <Stack direction="vertical" gap={1}>
        <Text type="body" weight="semibold">
          Mock payment QR
        </Text>
        <Text type="supporting">Use the exact amount shown above.</Text>
      </Stack>
    </Stack>
  );
}
