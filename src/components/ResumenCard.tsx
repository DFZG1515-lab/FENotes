import { Sparkles } from 'lucide-react';
import type { Resumen } from '../types';

interface Props {
  resumen: Resumen;
  onRegenerar?: () => void;
  regenerando?: boolean;
}

export default function ResumenCard({ resumen, onRegenerar, regenerando = false }: Props) {
  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <div className="flex items-center gap-1.5 text-xs font-bold text-gilt">
        <Sparkles size={13} strokeWidth={2.2} />
        Resumen con IA · {resumen.estilo === 'estudio' ? 'Estudio detallado' : 'Devocional corto'}
      </div>

      <p className="mt-2.5 font-serif text-base leading-[1.45] text-ink">{resumen.ideaCentral}</p>

      {resumen.puntosPrincipales.length > 0 && (
        <>
          <div className="eyebrow mt-3 text-ink-muted">Puntos</div>
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[13px] leading-relaxed text-ink">
            {resumen.puntosPrincipales.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </>
      )}

      {resumen.versiculosClave.length > 0 && (
        <>
          <div className="eyebrow mt-3 text-ink-muted">Versículos clave</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {resumen.versiculosClave.map((v, i) => (
              <span key={i} className="rounded-full border border-line bg-page px-2.5 py-1 text-xs font-bold text-gilt">
                {v}
              </span>
            ))}
          </div>
        </>
      )}

      {resumen.aplicacion && (
        <>
          <div className="eyebrow mt-3 text-ink-muted">Para esta semana</div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink">{resumen.aplicacion}</p>
        </>
      )}

      {onRegenerar && (
        <button
          type="button"
          onClick={onRegenerar}
          disabled={regenerando}
          className="mt-3.5 h-8 rounded-lg border border-line bg-page px-3 text-xs font-semibold text-ink-soft hover:bg-cream-dark/50 disabled:opacity-50"
        >
          {regenerando ? 'Generando…' : 'Regenerar resumen'}
        </button>
      )}
    </div>
  );
}
