import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

/**
 * Cabecera de color de cada pantalla en celular: llega hasta arriba, debajo de la hora,
 * y termina con las esquinas inferiores redondeadas. En escritorio no se muestra.
 */
export default function BloqueVino({ children, className = '' }: Props) {
  return (
    <section
      className={`flex flex-col rounded-b-[30px] bg-vino px-6 pb-6 text-crema lg:hidden ${className}`}
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 14px)' }}
    >
      {children}
    </section>
  );
}
