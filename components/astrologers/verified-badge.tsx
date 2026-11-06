/** The app's verified tick (ap assets/svgIcons/verified-check.svg), in its colour primary400 #BE7B71. */
export function VerifiedBadge({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      role="img"
      aria-label="Verified astrologer"
      className={`shrink-0 ${className ?? ''}`}
    >
      <path
        d="M13.75 6.5375L12.225 4.8L12.4375 2.5L10.1813 1.9875L9 0L6.875 0.9125L4.75 0L3.56875 1.9875L1.3125 2.49375L1.525 4.79375L0 6.5375L1.525 8.275L1.3125 10.5813L3.56875 11.0938L4.75 13.0813L6.875 12.1625L9 13.075L10.1813 11.0875L12.4375 10.575L12.225 8.275L13.75 6.5375ZM5.625 9.6625L3.125 7.1625L4.00625 6.28125L5.625 7.89375L9.74375 3.775L10.625 4.6625L5.625 9.6625Z"
        fill="#BE7B71"
      />
    </svg>
  );
}
