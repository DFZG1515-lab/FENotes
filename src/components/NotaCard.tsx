import { Link } from 'react-router-dom';
import { Sparkles, Star } from 'lucide-react';
import { extractoNota, fechaMuyCorta, tituloNota } from '../lib/nota';
import type { Nota } from '../types';

function formatearFecha(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

interface Props {
  nota: Nota;
  seleccionada?: boolean;
}

export default function NotaCard({ nota, seleccionada = false }: Props) {
  const meta = [nota.predicador, nota.iglesia].filter(Boolean).join(' · ');
  const extracto = extractoNota(nota);

  return (
    <Link
      to={`/nota/${nota.id}`}
      aria-current={seleccionada ? 'page' : undefined}
      className={`relative block border-b border-linea-suave py-2.5 transition-colors active:opacity-70 lg:rounded-xl lg:border-0 lg:py-3 lg:pl-6 lg:pr-4 ${
        seleccionada ? 'lg:bg-page lg:shadow-[0_1px_2px_rgba(34,28,24,0.06)]' : 'lg:hover:bg-page/70'
      }`}
    >
      {/* Celular: título y fecha en una línea, debajo una frase de la nota. */}
      <div className="lg:hidden">
        <div className="flex items-baseline justify-between gap-3">
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="font-serif text-[20px] leading-tight text-ink">{tituloNota(nota)}</span>
            {nota.destacada && (
              <span role="img" aria-label="Destacada" className="h-1.5 w-1.5 shrink-0 -translate-y-[3px] rounded-full bg-vino" />
            )}
          </span>
          <span className="shrink-0 text-xs text-gris">{fechaMuyCorta(nota.fecha)}</span>
        </div>
        {extracto && <p className="mt-0.5 line-clamp-1 font-serif text-base italic text-tinta-suave">{extracto}</p>}
      </div>

      {/* Escritorio: el listón marca la nota abierta. */}
      <div className="hidden lg:block">
        {seleccionada && <span aria-hidden className="ribbon absolute left-2.5 top-0 h-10 w-[5px]" />}

        <div className="flex items-center justify-between gap-2">
          <span className="eyebrow text-ink-muted">{formatearFecha(nota.fecha)}</span>
          <span className="flex items-center gap-1.5">
            {nota.destacada && <Star size={12} className="text-gilt" fill="currentColor" aria-label="Destacada" />}
            {nota.resumen && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-gilt">
                <Sparkles size={11} strokeWidth={2.2} />
                Resumen
              </span>
            )}
          </span>
        </div>

        <h3 className="mt-1.5 font-serif text-[19px] font-medium leading-tight text-ink">{tituloNota(nota)}</h3>

        {meta && <p className="mt-1 text-[13px] text-ink-muted">{meta}</p>}
      </div>
    </Link>
  );
}
