interface Props {
  size?: number;
}

// Mismo dibujo que scripts/gen-icons.cjs (hoja de notas + cruz), recortado a su bbox real.
export default function Logo({ size = 20 }: Props) {
  return (
    <svg
      width={size}
      height={(size * 20.4) / 14.9}
      viewBox="2.3 1.8 14.9 20.4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="2.5" width="13.5" height="19" rx="1.3" />
      <line x1="9.7" y1="6.2" x2="9.7" y2="16.5" />
      <line x1="6.4" y1="9.3" x2="13" y2="9.3" />
    </svg>
  );
}
