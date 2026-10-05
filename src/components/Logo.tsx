interface Props {
  /** Alto aproximado en px (el listón es angosto: el ancho se deriva del alto). */
  size?: number;
  className?: string;
  /** Color del listón; en fondos oscuros conviene el dorado. */
  liston?: string;
}

// El listón separador de la Biblia, mismo dibujo que scripts/gen-icons.cjs.
export default function Logo({ size = 20, className, liston = 'var(--color-ribbon)' }: Props) {
  const alto = size * 1.4;
  return (
    <svg width={(alto * 8) / 19} height={alto} viewBox="8 2 8 19" className={className} aria-hidden>
      <path d="M8 2h8v19l-4-3.6L8 21z" fill={liston} />
    </svg>
  );
}
