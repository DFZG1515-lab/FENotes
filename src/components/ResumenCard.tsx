import { Sparkles } from 'lucide-react';
import type { Resumen } from '../types';

export default function ResumenCard({ resumen }: { resumen: Resumen }) {
  return (
    <div className="rounded-2xl border border-sage/30 bg-sage/5 p-4">
      <div className="mb-3 flex items-center gap-2 text-sage-dark">
        <Sparkles size={16} />
        <span className="text-sm font-semibold">
          Resumen con IA · {resumen.estilo === 'estudio' ? 'Estudio detallado' : 'Devocional corto'}
        </span>
      </div>

      <div className="space-y-3 text-sm text-bark">
        <div>
          <h4 className="mb-1 font-semibold text-bark">Idea central</h4>
          <p className="leading-relaxed">{resumen.ideaCentral}</p>
        </div>

        {resumen.puntosPrincipales.length > 0 && (
          <div>
            <h4 className="mb-1 font-semibold text-bark">Puntos principales</h4>
            <ul className="list-disc space-y-1 pl-5 leading-relaxed">
              {resumen.puntosPrincipales.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}

        {resumen.versiculosClave.length > 0 && (
          <div>
            <h4 className="mb-1 font-semibold text-bark">Versículos clave</h4>
            <div className="flex flex-wrap gap-2">
              {resumen.versiculosClave.map((v, i) => (
                <span key={i} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-sage-dark">
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="mb-1 font-semibold text-bark">Aplicación práctica</h4>
          <p className="leading-relaxed">{resumen.aplicacion}</p>
        </div>
      </div>
    </div>
  );
}
