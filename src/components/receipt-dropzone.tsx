"use client";

import { useEffect, useId, useMemo, useState, type DragEvent } from "react";
import { motion } from "motion/react";
import { ImageIcon, X } from "lucide-react";
import {
  FieldStatus,
  IconButton,
  Stack,
  Text,
  VisuallyHidden,
} from "@astryxdesign/core";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from "@/types/order";

const ACCEPTED_TYPES = ACCEPTED_FILE_TYPES.split(",");
const MAX_SIZE_MB = Math.round(MAX_FILE_SIZE / (1024 * 1024));

/**
 * Astryx's FileInput enforced these itself, but it has no slot for custom
 * content — so owning the dropzone means owning the validation too.
 */
function findProblem(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Use a JPG, PNG, or WebP image.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return `That image is larger than ${MAX_SIZE_MB} MB.`;
  }
  return null;
}

type ReceiptDropzoneProps = {
  receipt: File | null;
  error: string | null;
  isDisabled: boolean;
  onChange: (receipt: File | null) => void;
  onError: (message: string) => void;
};

/**
 * The receipt upload: one full-width area that is the file picker when empty
 * and the receipt itself once something has been chosen. Picking again
 * replaces the image; the overlaid close button clears it.
 */
export function ReceiptDropzone({
  receipt,
  error,
  isDisabled,
  onChange,
  onError,
}: ReceiptDropzoneProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);

  const previewUrl = useMemo(
    () => (receipt ? URL.createObjectURL(receipt) : null),
    [receipt],
  );

  // Cleanup only — deriving the URL itself happens during render above.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function acceptFile(file: File | undefined | null) {
    if (!file) return;
    const problem = findProblem(file);
    // A rejected file leaves any already-valid receipt in place; only the
    // message changes, so one bad drop cannot cost the buyer their upload.
    if (problem) {
      onError(problem);
      return;
    }
    onChange(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (isDisabled) return;
    acceptFile(event.dataTransfer.files?.[0]);
  }

  return (
    <Stack direction="vertical" gap={2}>
      <div
        className="ssw-dropzone"
        data-dragging={isDragging || undefined}
        data-filled={receipt ? true : undefined}
        data-invalid={error ? true : undefined}
        data-disabled={isDisabled || undefined}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isDisabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          id={inputId}
          type="file"
          className="ssw-dropzone__input"
          accept={ACCEPTED_FILE_TYPES}
          disabled={isDisabled}
          required
          onChange={(event) => {
            acceptFile(event.target.files?.[0]);
            // Reset so re-picking the same file still fires a change.
            event.target.value = "";
          }}
        />

        {previewUrl && (
          <motion.img
            key={previewUrl}
            src={previewUrl}
            alt="Payment receipt preview"
            className="ssw-dropzone__image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}

        {/* The whole area is the picker's label, so a click anywhere opens it. */}
        <label htmlFor={inputId} className="ssw-dropzone__trigger">
          <VisuallyHidden>Payment receipt</VisuallyHidden>
          {!receipt && (
            <Stack direction="vertical" hAlign="center" gap={2}>
              <ImageIcon
                className="ssw-dropzone__icon"
                size={32}
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <Stack direction="vertical" hAlign="center" gap={0.5}>
                <Text type="body" weight="semibold">
                  Choose file
                </Text>
                <Text type="supporting" justify="center">
                  or drag it here &middot; JPG, PNG, or WebP &middot; Max{" "}
                  {MAX_SIZE_MB} MB
                </Text>
              </Stack>
            </Stack>
          )}
        </label>

        {receipt && (
          <span className="ssw-dropzone__remove">
            <IconButton
              label="Remove receipt"
              icon={<X size={16} />}
              variant="secondary"
              size="sm"
              isDisabled={isDisabled}
              onClick={() => onChange(null)}
            />
          </span>
        )}
      </div>

      {error && <FieldStatus type="error" message={error} variant="detached" />}
    </Stack>
  );
}
