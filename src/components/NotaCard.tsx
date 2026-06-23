import { Link } from 'react-router-dom';
import { Sparkles, MapPin, User, Star } from 'lucide-react';
import type { Nota } from '../types';

function formatearFecha(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function NotaCard({ nota }: { nota: Nota }) {
  return (
    <Link
      to={`/nota/${nota.id}`}
      className="block rounded-2xl border border-line bg-surface p-4 active:bg-cream-dark/40"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-bark-light">
          {formatearFecha(nota.fecha)}
        </span>
        <div className="flex items-center gap-1.5">
          {nota.destacada && <Star size={14} className="text-clay" fill="currentColor" />}
          {nota.resumen && (
            <span className="flex items-center gap-1 rounded-full bg-sage/10 px-2 py-1 text-[11px] font-medium text-sage-dark">
              <Sparkles size={12} />
              Resumen
            </span>
          )}
        </div>
      </div>
      <h3 className="mt-1.5 text-base font-semibold text-bark">
        {nota.tema || nota.versiculos[0]?.referencia || 'Nota sin título'}
      </h3>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-bark-light">
        {nota.predicador && (
          <span className="flex items-center gap-1">
            <User size={14} />
            {nota.predicador}
          </span>
        )}
        {nota.iglesia && (
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {nota.iglesia}
          </span>
        )}
      </div>
    </Link>
  );
}
