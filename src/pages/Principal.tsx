import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus, RefreshCw, Search } from 'lucide-react';
import { EVENTO_NOTAS_CAMBIARON, getNotas } from '../lib/storage';
import { fechaDeHoy, saludo, usePanDeHoy } from '../lib/panDeHoy';
import type { Nota } from '../types';

const RECIENTES = 3;

function fechaCorta(fecha: string): string {
  const texto = new Date(fecha + 'T00:00:00').toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function tituloNota(nota: Nota): string {
  return nota.tema || nota.versiculos[0]?.referencia || 'Nota sin título';
}

/** Pantalla principal: versículo del día, botón para anotar y las notas más recientes. */
export default function Principal() {
  const [notas, setNotas] = useState(getNotas);
  const pan = usePanDeHoy();

  useEffect(() => {
    const recargar = () => setNotas(getNotas());
    window.addEventListener(EVENTO_NOTAS_CAMBIARON, recargar);
    return () => window.removeEventListener(EVENTO_NOTAS_CAMBIARON, recargar);
  }, []);

  const recientes = notas.slice(0, RECIENTES);

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col px-5 pb-6 pt-2 lg:px-10 lg:pt-10">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-ink-muted">{fechaDeHoy()}</span>
        <Link
          to="/notas"
          state={{ buscar: true }}
          aria-label="Buscar notas"
          className="-mr-2 flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted active:bg-cream-dark"
        >
          <Search size={18} strokeWidth={1.9} />
        </Link>
      </div>
      <h2 className="mt-1 font-serif text-[32px] font-medium leading-tight tracking-tight text-ink">{saludo()}</h2>

      {/* Pan de hoy */}
      <section className="mt-4 rounded-2xl bg-page px-4 py-4 shadow-[0_1px_2px_rgba(34,28,24,0.06)]">
        <span className="eyebrow text-ribbon">Pan de hoy · {pan.referencia}</span>
        {pan.estado === 'cargando' && <div className="mt-3 h-12 animate-pulse rounded-lg bg-cream-dark/60" aria-label="Cargando versículo" />}
        {pan.estado === 'listo' && (
          <p className="mt-2 font-serif text-[18px] italic leading-[1.45] text-ink">“{pan.texto}”</p>
        )}
        {pan.estado === 'error' && (
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">No se pudo cargar el versículo. Revisa tu conexión.</p>
            <button
              type="button"
              onClick={pan.reintentar}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink"
            >
              <RefreshCw size={12} />
              Reintentar
            </button>
          </div>
        )}
      </section>

      <Link
        to="/nueva"
        className="mt-4 flex h-14 items-center justify-center gap-2 rounded-2xl bg-ribbon text-base font-semibold text-white shadow-sm shadow-ribbon/30 transition-colors hover:bg-ribbon-dark active:opacity-90"
      >
        <Plus size={18} strokeWidth={2.4} />
        Nueva nota
      </Link>

      {/* Recientes */}
      <div className="mt-7 flex items-baseline justify-between">
        <span className="eyebrow text-ink-muted">Recientes</span>
        {notas.length > 0 && (
          <Link to="/notas" className="text-[13px] font-semibold text-ribbon">
            Ver todas{notas.length > RECIENTES ? ` (${notas.length})` : ''}
          </Link>
        )}
      </div>

      {recientes.length === 0 ? (
        <p className="mt-2 rounded-2xl bg-page px-4 py-5 text-sm leading-relaxed text-ink-muted shadow-[0_1px_2px_rgba(34,28,24,0.06)]">
          Aún no tienes notas. Toca <span className="font-semibold text-ink">Nueva nota</span> en el próximo servicio; los versículos que menciones se
          guardan solos.
        </p>
      ) : (
        <ul className="mt-2 overflow-hidden rounded-2xl bg-page shadow-[0_1px_2px_rgba(34,28,24,0.06)]">
          {recientes.map((nota) => (
            <li key={nota.id} className="border-b border-line last:border-b-0">
              <Link to={`/nota/${nota.id}`} className="flex items-center gap-3 px-4 py-3 active:bg-cream-dark/50">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-ink">{tituloNota(nota)}</span>
                  <span className="block truncate text-[13px] text-ink-muted">
                    {[fechaCorta(nota.fecha), nota.predicador].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-ink-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
