interface Props {
  size?: number;
  className?: string;
  /** Color del listón; en fondos oscuros conviene uno más claro. */
  liston?: string;
}

// Mismo dibujo que scripts/gen-icons.cjs (Biblia con lomo, cruz y listón), recortado a su bbox real.
export default function Logo({ size = 20, className, liston = 'var(--color-ribbon)' }: Props) {
  return (
    <svg
      width={size}
      height={(size * 22.25) / 14.8}
      viewBox="3.85 1.35 14.8 22.25"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="4.5" y="2" width="13.5" height="17.5" rx="1.3" />
      <line x1="7.2" y1="2" x2="7.2" y2="19.5" />
      <line x1="12.6" y1="6" x2="12.6" y2="14.2" />
      <line x1="9.9" y1="8.6" x2="15.3" y2="8.6" />
      <path d="M14.4 20.15 H16.2 V23.6 L15.3 22.7 L14.4 23.6 Z" fill={liston} stroke="none" />
    </svg>
  );
}
