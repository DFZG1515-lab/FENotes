import type { ReactNode } from 'react';
import { Outlet, useMatch } from 'react-router-dom';

interface Props {
  lista: ReactNode;
}

/**
 * Panel dividido de notas. En escritorio muestra la lista a la izquierda y la
 * página de lectura a la derecha; en celular muestra solo una de las dos según la ruta.
 */
export default function NotasSplit({ lista }: Props) {
  const enDetalle = Boolean(useMatch('/nota/:id'));

  return (
    <div className="flex min-h-0 flex-1 lg:h-full">
      <section
        className={`${enDetalle ? 'hidden lg:flex' : 'flex'} min-h-0 w-full flex-col lg:h-full lg:w-[372px] lg:shrink-0 lg:overflow-hidden lg:border-r lg:border-line`}
      >
        {lista}
      </section>
      <section
        className={`${enDetalle ? 'flex' : 'hidden lg:flex'} min-h-0 min-w-0 flex-1 flex-col bg-page lg:h-full lg:overflow-y-auto lg:border-t-[3px] lg:border-gilt-light`}
      >
        <Outlet />
      </section>
    </div>
  );
}
