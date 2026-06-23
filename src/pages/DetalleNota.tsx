import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Pencil, Sparkles, Trash2 } from 'lucide-react';
import { deleteNota, getConfiguracion, getNota, saveNota } from '../lib/storage';
import { GroqError, generarResumen } from '../lib/groq';
import ResumenCard from '../components/ResumenCard';
import type { EstiloResumen } from '../types';

function formatearFecha(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function DetalleNota() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nota, setNota] = useState(() => getNota(id!));
  const [estilo, setEstilo] = useState<EstiloResumen>('devocional');
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);

  if (!nota) {
    return (
      <div className="px-4 pt-8 text-center text-bark-light">
        <p>Esta nota ya no existe.</p>
      </div>
    );
  }

  async function handleGenerarResumen() {
    setError('');
    setGenerando(true);
    try {
      const { apiKey } = getConfiguracion();
      const resumen = await generarResumen(nota!, estilo, apiKey);
      const actualizada = { ...nota!, resumen, actualizadoEn: new Date().toISOString() };
      saveNota(actualizada);
      setNota(actualizada);
    } catch (e) {
      setError(e instanceof GroqError ? e.message : 'Ocurrió un error inesperado al generar el resumen.');
    } finally {
      setGenerando(false);
    }
  }

  function handleEliminar() {
    deleteNota(nota!.id);
    navigate('/');
  }

  return (
    <div className="px-4 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-bark-light">
          {formatearFecha(nota.fecha)}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(`/nota/${nota!.id}/editar`)}
            aria-label="Editar nota"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-bark-light active:bg-cream-dark/40"
          >
            <Pencil size={18} />
          </button>
          <button
            type="button"
            onClick={() => setConfirmandoEliminar(true)}
            aria-label="Eliminar nota"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-600 active:bg-red-50"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-bark">{nota.tema || 'Nota sin título'}</h2>
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-bark-light">
        {nota.predicador && <span>{nota.predicador}</span>}
        {nota.iglesia && <span>{nota.iglesia}</span>}
      </div>

      {nota.versiculos.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {nota.versiculos.map((v) => (
            <span key={v.id} className="rounded-full bg-sage/10 px-3 py-1 text-xs font-medium text-sage-dark">
              {v.referencia}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-line bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-bark-light">Notas originales</h3>
        <p className="whitespace-pre-wrap text-base leading-relaxed text-bark">{nota.contenido}</p>
      </div>

      <div className="mt-5">
        {!nota.resumen && (
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setEstilo('devocional')}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-medium ${
                estilo === 'devocional' ? 'border-sage bg-sage/10 text-sage-dark' : 'border-line bg-white text-bark-light'
              }`}
            >
              Corto / devocional
            </button>
            <button
              type="button"
              onClick={() => setEstilo('estudio')}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-medium ${
                estilo === 'estudio' ? 'border-sage bg-sage/10 text-sage-dark' : 'border-line bg-white text-bark-light'
              }`}
            >
              Detallado / estudio
            </button>
          </div>
        )}

        {error && (
          <div className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {generando ? (
          <div className="flex min-h-[56px] items-center justify-center gap-2 rounded-xl border border-line bg-white py-4 text-sm text-bark-light">
            <Loader2 size={18} className="animate-spin" />
            Generando resumen, puede tardar unos segundos...
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGenerarResumen}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sage py-3.5 text-base font-semibold text-cream active:bg-sage-dark"
          >
            <Sparkles size={18} />
            {nota.resumen ? 'Regenerar resumen con IA' : 'Generar resumen con IA'}
          </button>
        )}
      </div>

      {nota.resumen && (
        <div className="mt-4">
          <ResumenCard resumen={nota.resumen} />
        </div>
      )}

      {confirmandoEliminar && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-bark/40 px-4 pb-28">
          <div className="w-full max-w-[400px] rounded-2xl bg-white p-5">
            <h3 className="text-base font-semibold text-bark">¿Eliminar esta nota?</h3>
            <p className="mt-1 text-sm text-bark-light">Esta acción no se puede deshacer.</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmandoEliminar(false)}
                className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-bark"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEliminar}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-medium text-white"
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
