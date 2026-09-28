import { Link } from 'react-router-dom';
import { Sparkles, Star } from 'lucide-react';
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
  const preview = nota.resumen?.ideaCentral || nota.contenido;
  const meta = [nota.predicador, nota.iglesia].filter(Boolean).join(' · ');

  return (
    <Link
      to={`/nota/${nota.id}`}
      aria-current={seleccionada ? 'page' : undefined}
      className={`relative block rounded-xl border py-3.5 pl-6 pr-4 transition-colors active:bg-cream-dark/60 ${
        seleccionada
          ? 'border-line bg-page shadow-[0_1px_2px_rgba(34,28,24,0.05)]'
          : 'border-line bg-page lg:border-transparent lg:bg-transparent lg:hover:bg-page/70'
      }`}
    >
      {/* En celular el listón marca las destacadas; en escritorio, la nota abierta. */}
      {nota.destacada && <span aria-hidden className="ribbon absolute left-2.5 top-0 h-9 w-[5px] lg:hidden" />}
      {seleccionada && <span aria-hidden className="ribbon absolute left-2.5 top-0 hidden h-10 w-[5px] lg:block" />}

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

      <h3 className="mt-1.5 font-serif text-[19px] font-medium leading-tight text-ink">
        {nota.tema || nota.versiculos[0]?.referencia || 'Nota sin título'}
      </h3>

      {meta && <p className="mt-1 text-[13px] text-ink-muted">{meta}</p>}

      {preview && <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">{preview}</p>}
    </Link>
  );
}
