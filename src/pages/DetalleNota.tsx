import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Loader2, Pencil, Sparkles, Trash2, Share2, Star } from 'lucide-react';
import { deleteNota, getNota, saveNota } from '../lib/storage';
import { AIError, generarResumenIA } from '../lib/ai';
import { sincronizarWidgetSilencioso } from '../lib/widgetSync';
import ResumenCard from '../components/ResumenCard';
import VersiculoMargen from '../components/VersiculoMargen';
import type { EstiloResumen, Nota } from '../types';

function formatearFecha(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatearFechaCorta(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

function construirTextoCompartir(nota: Nota): string {
  const partes: string[] = [];
  partes.push(`${nota.tema || 'Nota'} — ${formatearFecha(nota.fecha)}`);
  if (nota.predicador) partes.push(nota.predicador);
  if (nota.iglesia) partes.push(nota.iglesia);
  partes.push('');

  if (nota.resumen) {
    partes.push(nota.resumen.ideaCentral);
    if (nota.resumen.puntosPrincipales.length > 0) {
      partes.push('');
      partes.push('Puntos principales:');
      nota.resumen.puntosPrincipales.forEach((p) => partes.push(`• ${p}`));
    }
    if (nota.resumen.aplicacion) {
      partes.push('');
      partes.push(nota.resumen.aplicacion);
    }
  } else {
    partes.push(nota.contenido);
  }

  if (nota.versiculos.length > 0) {
    partes.push('');
    partes.push(`Versículos: ${nota.versiculos.map((v) => v.referencia).join(', ')}`);
  }

  partes.push('');
  partes.push('— Daily Bread');
  return partes.join('\n');
}

const claseAccion =
  'flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-ink-soft transition-colors hover:bg-paper active:bg-cream-dark lg:border-line lg:bg-page';

/** Remonta la página al cambiar de nota para que todo su estado empiece limpio. */
export default function DetalleNota() {
  const { id } = useParams();
  return <DetalleNotaContenido key={id} id={id!} />;
}

function DetalleNotaContenido({ id }: { id: string }) {
  const navigate = useNavigate();
  const [nota, setNota] = useState(() => getNota(id));
  const [estilo, setEstilo] = useState<EstiloResumen>('devocional');
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);

  if (!nota) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-ink-muted">
        <p>Esta nota ya no existe.</p>
        <Link to="/notas" className="mt-3 text-sm font-semibold text-ribbon">
          Volver a mis notas
        </Link>
      </div>
    );
  }

  async function handleGenerarResumen() {
    setError('');
    setGenerando(true);
    try {
      const resumen = await generarResumenIA(nota!, estilo);
      const actualizada = { ...nota!, resumen, actualizadoEn: new Date().toISOString() };
      saveNota(actualizada);
      sincronizarWidgetSilencioso();
      setNota(actualizada);
    } catch (e) {
      setError(e instanceof AIError ? e.message : 'Ocurrió un error inesperado al generar el resumen.');
    } finally {
      setGenerando(false);
    }
  }

  function handleEliminar() {
    deleteNota(nota!.id);
    navigate('/notas');
  }

  function handleCompartir() {
    const texto = construirTextoCompartir(nota!);
    if (navigator.share) {
      navigator.share({ text: texto }).catch(() => {});
    } else {
      navigator.clipboard.writeText(texto);
      setError('');
      alert('Tu navegador no soporta compartir directo. Copiamos el texto al portapapeles.');
    }
  }

  function handleToggleDestacada() {
    const actualizada = { ...nota!, destacada: !nota!.destacada, actualizadoEn: new Date().toISOString() };
    saveNota(actualizada);
    setNota(actualizada);
  }

  const meta = [nota.predicador, nota.iglesia].filter(Boolean).join(' · ');
  const enlaceVersiculo = { notaId: nota.id, fecha: formatearFechaCorta(nota.fecha), tema: nota.tema };

  return (
    <div className="flex flex-1 flex-col border-t-[3px] border-gilt-light lg:border-0">
      {/* Fila superior: volver (celular) o fecha (escritorio) + acciones */}
      <div className="safe-top flex items-center justify-between px-2 pt-2 lg:px-10 lg:pt-6">
        <button
          type="button"
          onClick={() => navigate('/notas')}
          aria-label="Volver a notas"
          className="flex h-10 w-10 items-center justify-center text-ink-soft lg:hidden"
        >
          <ChevronLeft size={22} />
        </button>
        <span className="eyebrow hidden text-ink-muted lg:block">{formatearFecha(nota.fecha)}</span>

        <div className="flex gap-0.5 lg:gap-2">
          <button
            type="button"
            onClick={handleToggleDestacada}
            aria-label={nota.destacada ? 'Quitar destacado' : 'Marcar como destacada'}
            className={`${claseAccion} text-gilt`}
          >
            <Star size={17} fill={nota.destacada ? 'currentColor' : 'none'} />
          </button>
          <button type="button" onClick={handleCompartir} aria-label="Compartir nota" className={claseAccion}>
            <Share2 size={17} />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/nota/${nota!.id}/editar`)}
            aria-label="Editar nota"
            className={claseAccion}
          >
            <Pencil size={17} />
          </button>
          <button
            type="button"
            onClick={() => setConfirmandoEliminar(true)}
            aria-label="Eliminar nota"
            className={`${claseAccion} text-[#9a3a3a]`}
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      <div className="px-5 pt-2 lg:px-10 lg:pt-3">
        <span className="eyebrow text-ink-muted lg:hidden">{formatearFecha(nota.fecha)}</span>
        <h1 className="mt-2 font-serif text-[32px] font-medium leading-[1.1] tracking-tight text-ink lg:mt-0 lg:text-[40px]">
          {nota.tema || 'Nota sin título'}
        </h1>
        {meta && <p className="mt-2 text-sm text-ink-muted">{meta}</p>}
      </div>

      <div className="mx-5 mt-5 hidden h-px bg-line lg:mx-10 lg:block" />

      <div className="flex flex-1 flex-col px-5 pb-10 pt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_272px] lg:content-start lg:gap-x-11 lg:px-10 lg:pt-6">
        {/* Versículos al margen: tarjetas horizontales en celular, columna en escritorio */}
        {nota.versiculos.length > 0 && (
          <div className="order-1 lg:order-2 lg:col-start-2 lg:row-start-1">
            <div className="eyebrow mb-1 flex items-center gap-2 text-gilt">
              <span>Al margen</span>
              <span className="h-px flex-1 bg-gilt-light" />
            </div>
            <div className="scroll-x -mx-5 flex items-start gap-2.5 overflow-x-auto px-5 pb-1 pt-2 lg:mx-0 lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-visible lg:px-0 lg:pt-0">
              {nota.versiculos.map((v) => (
                <VersiculoMargen key={v.id} referencia={v.referencia} variante="tarjeta" enlace={enlaceVersiculo} />
              ))}
            </div>
          </div>
        )}

        <div className="order-2 mt-6 min-w-0 lg:order-1 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mt-0">
          <div className="eyebrow mb-2.5 text-ink-muted">Lo que anoté</div>
          <p className="whitespace-pre-wrap font-serif text-lg leading-[1.65] text-ink">{nota.contenido}</p>
        </div>

        <div className="order-3 mt-6 lg:order-3 lg:col-start-2 lg:row-start-2 lg:mt-5">
          {error && <div className="mb-3 rounded-xl bg-[#f6e3e3] px-4 py-3 text-sm text-[#7f2e2e]">{error}</div>}

          {nota.resumen ? (
            <ResumenCard resumen={nota.resumen} onRegenerar={handleGenerarResumen} regenerando={generando} />
          ) : (
            <div className="rounded-xl border border-dashed border-gilt-light bg-paper p-4">
              <p className="text-[13px] leading-relaxed text-ink-soft">
                Esta nota aún no tiene resumen. La IA leerá lo que anotaste y lo ordenará en idea central, puntos y
                una aplicación práctica.
              </p>
              <div className="mt-3 flex gap-1.5">
                {(
                  [
                    ['devocional', 'Devocional corto'],
                    ['estudio', 'Estudio detallado'],
                  ] as const
                ).map(([valor, etiqueta]) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => setEstilo(valor)}
                    className={`h-[30px] rounded-full border px-3 text-xs font-semibold ${
                      estilo === valor ? 'border-ribbon bg-page text-ribbon' : 'border-line bg-page text-ink-muted'
                    }`}
                  >
                    {etiqueta}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleGenerarResumen}
                disabled={generando}
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-ribbon text-[13px] font-semibold text-white hover:bg-ribbon-dark disabled:opacity-60"
              >
                {generando ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                {generando ? 'Generando resumen…' : 'Generar resumen con IA'}
              </button>
            </div>
          )}
        </div>
      </div>

      {confirmandoEliminar && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 px-4 pb-10 lg:items-center lg:pb-0">
          <div className="w-full max-w-[400px] rounded-2xl bg-page p-5 shadow-xl shadow-ink/20">
            <h3 className="font-serif text-xl font-medium text-ink">¿Eliminar esta nota?</h3>
            <p className="mt-1 text-sm text-ink-muted">Esta acción no se puede deshacer.</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmandoEliminar(false)}
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
