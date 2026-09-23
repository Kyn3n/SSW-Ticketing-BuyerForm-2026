import { Stack, Text } from "@astryxdesign/core";

/** Buyer-facing contact details for order, availability, and refund questions. */
export function SupportContact() {
  return (
    <Stack direction="vertical" gap={1.5} className="ssw-support-contact">
      <Text type="body" weight="semibold">
        Contact the PIC
      </Text>
      <Stack direction="vertical" gap={0.5}>
        <Text type="supporting">Mr. Ng</Text>
        <Text type="supporting">
          <a href="tel:+60172815801">+60 17-281 5801</a>
        </Text>
        <Text type="supporting">
          <a href="mailto:selangorsymphonicwinds@gmail.com">
            selangorsymphonicwinds@gmail.com
          </a>
        </Text>
      </Stack>
    </Stack>
  );
}
