/**
 * Round tick that draws itself in: the ring sweeps round, then the check
 * strokes on. Purely decorative — the surrounding copy carries the meaning.
 */
export function SuccessTick() {
  return (
    <svg
      className="ssw-tick"
      viewBox="0 0 64 64"
      width={72}
      height={72}
      role="img"
      aria-label="Order received"
    >
      <circle className="ssw-tick__halo" cx="32" cy="32" r="30" />
      <circle className="ssw-tick__ring" cx="32" cy="32" r="26" />
      <path className="ssw-tick__check" d="M20 33.5 L28.5 42 L44 24" />
    </svg>
  );
}
