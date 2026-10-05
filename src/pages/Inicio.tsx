import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useMatch } from 'react-router-dom';
import { ChevronLeft, NotebookText, Search } from 'lucide-react';
import { deleteNota, EVENTO_NOTAS_CAMBIARON, getNotas } from '../lib/storage';
import NotaCard from '../components/NotaCard';
import SwipeableRow from '../components/SwipeableRow';
import Logo from '../components/Logo';
import type { Nota } from '../types';

type Filtro = 'todas' | 'destacadas' | 'resumen';

const FILTROS: { valor: Filtro; etiqueta: string }[] = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'destacadas', etiqueta: 'Destacadas' },
  { valor: 'resumen', etiqueta: 'Con resumen' },
];

function mesDe(fecha: string): string {
  const texto = new Date(fecha + 'T00:00:00').toLocaleDateString('es', { month: 'long', year: 'numeric' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Agrupa notas (ya ordenadas por fecha) en bloques por mes. */
function agruparPorMes(notas: Nota[]): { mes: string; notas: Nota[] }[] {
  const grupos: { mes: string; notas: Nota[] }[] = [];
  for (const nota of notas) {
    const mes = mesDe(nota.fecha);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo?.mes === mes) ultimo.notas.push(nota);
    else grupos.push({ mes, notas: [nota] });
  }
  return grupos;
}

export default function Inicio() {
  const [notas, setNotas] = useState(getNotas);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [notaPendienteEliminar, setNotaPendienteEliminar] = useState<string | null>(null);
  const idAbierta = useMatch('/nota/:id')?.params.id;
  // Desde la lupa de Inicio llegamos con el buscador enfocado.
  const enfocarBusqueda = Boolean((useLocation().state as { buscar?: boolean } | null)?.buscar);

  useEffect(() => {
    const recargar = () => setNotas(getNotas());
    window.addEventListener(EVENTO_NOTAS_CAMBIARON, recargar);
    return () => window.removeEventListener(EVENTO_NOTAS_CAMBIARON, recargar);
  }, []);

  const filtradas = useMemo(() => {
    let resultado = notas;
    if (filtro === 'destacadas') resultado = resultado.filter((n) => n.destacada);
    if (filtro === 'resumen') resultado = resultado.filter((n) => n.resumen);
    const q = busqueda.trim().toLowerCase();
    if (q) {
      resultado = resultado.filter((n) =>
        [n.predicador, n.tema, n.iglesia, n.contenido, n.resumen?.ideaCentral ?? '', ...n.versiculos.map((v) => v.referencia)]
          .join(' ')
          .toLowerCase()
          .includes(q),
      );
    }
    return resultado;
  }, [notas, busqueda, filtro]);

  const grupos = useMemo(() => agruparPorMes(filtradas), [filtradas]);

  function handleEliminar() {
    if (!notaPendienteEliminar) return;
    deleteNota(notaPendienteEliminar);
    setNotaPendienteEliminar(null);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-5 pt-1 lg:px-6 lg:pt-7">
        <Link to="/" className="-ml-1 flex w-fit items-center gap-0.5 text-sm font-semibold text-ribbon lg:hidden">
          <ChevronLeft size={16} strokeWidth={2.4} />
          Inicio
        </Link>
        <div className="flex items-baseline justify-between pb-3 pt-1.5">
          <h2 className="font-serif text-[30px] font-medium tracking-tight text-ink lg:text-[28px]">Todas las notas</h2>
          <span className="text-[13px] text-ink-muted">{notas.length}</span>
        </div>
      </div>

      <div className="relative px-5 lg:px-4">
        <label htmlFor="buscar-notas" className="sr-only">
          Buscar notas
        </label>
        <Search size={16} className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 text-ink-muted lg:left-7" />
        <input
          id="buscar-notas"
          type="search"
          autoFocus={enfocarBusqueda}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Predicador, tema o versículo"
          className="h-[42px] w-full rounded-[10px] border border-line bg-page pl-9 pr-3 text-base text-ink placeholder:text-ink-muted/70 focus:border-gilt-light focus:outline-none lg:h-10 lg:text-sm"
        />
      </div>

      <div role="tablist" aria-label="Filtrar notas" className="mx-5 mt-2.5 grid grid-cols-3 rounded-[10px] bg-cream-dark p-0.5 lg:mx-4">
        {FILTROS.map(({ valor, etiqueta }) => (
          <button
            key={valor}
            type="button"
            role="tab"
            aria-selected={filtro === valor}
            onClick={() => setFiltro(valor)}
            className={`rounded-lg py-1.5 text-[13px] font-semibold transition-colors ${
              filtro === valor ? 'bg-page text-ink shadow-[0_1px_2px_rgba(34,28,24,0.08)]' : 'text-ink-muted'
            }`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 px-4 pb-6 pt-1 lg:overflow-y-auto lg:px-3 lg:pb-4">
        {filtradas.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 px-4 text-center">
            {notas.length === 0 ? (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-page text-gilt">
                  <Logo size={26} />
                </div>
                <div>
                  <p className="font-serif text-xl font-medium text-ink">Tu primera nota te espera</p>
                  <p className="mt-1.5 max-w-[260px] text-sm leading-relaxed text-ink-muted">
                    Anota lo que Dios te habla en cada servicio. Los versículos que menciones aparecerán al margen.
                  </p>
                </div>
              </>
            ) : (
              <>
                <NotebookText size={34} strokeWidth={1.5} className="text-ink-muted/50" />
                <p className="max-w-[240px] text-sm text-ink-muted">
                  {busqueda.trim() ? 'No hay notas que coincidan con esa búsqueda.' : 'No hay notas en este filtro.'}
                </p>
              </>
            )}
          </div>
        ) : (
          grupos.map((grupo) => (
            <section key={grupo.mes}>
              <h3 className="eyebrow px-1 pb-2 pt-4 text-ink-muted">{grupo.mes}</h3>
              <div className="flex flex-col gap-2 lg:gap-1">
                {grupo.notas.map((nota) => (
                  <SwipeableRow key={nota.id} onDelete={() => setNotaPendienteEliminar(nota.id)}>
                    <NotaCard nota={nota} seleccionada={nota.id === idAbierta} />
                  </SwipeableRow>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {notaPendienteEliminar && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 px-4 pb-28 lg:items-center lg:pb-0">
          <div className="w-full max-w-[400px] rounded-2xl bg-page p-5 shadow-xl shadow-ink/20">
            <h3 className="font-serif text-xl font-medium text-ink">¿Eliminar esta nota?</h3>
            <p className="mt-1 text-sm text-ink-muted">Esta acción no se puede deshacer.</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setNotaPendienteEliminar(null)}
                className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-ink hover:bg-paper"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEliminar}
                className="flex-1 rounded-xl bg-[#9a3a3a] py-3 text-sm font-semibold text-white hover:bg-[#7f2e2e]"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
