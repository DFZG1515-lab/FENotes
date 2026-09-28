import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, NotebookText } from 'lucide-react';
import { parseReferencia } from '../lib/bibleRef';
import { BibleError, obtenerTextoCapitulo, type VersoTexto } from '../lib/bible';

interface EstadoNavegacion {
  referencia: string;
  notaId?: string;
  fecha?: string;
  tema?: string;
}

export default function VersiculoDetalle() {
  const location = useLocation();
  const navigate = useNavigate();
  const estado = location.state as EstadoNavegacion | null;

  const referencia = estado?.referencia ?? '';
  const parsed = useMemo(() => (referencia ? parseReferencia(referencia) : null), [referencia]);
  const errorReferencia = !referencia
    ? 'No se especificó qué versículo mostrar.'
    : !parsed
      ? 'No pudimos interpretar esta referencia bíblica.'
      : '';

  const [carga, setCarga] = useState<{ referencia: string; versos: VersoTexto[] | null; error: string } | null>(null);
  const cargaActual = carga?.referencia === referencia ? carga : null;
  const cargando = !errorReferencia && !cargaActual;
  const versos = cargaActual?.versos ?? null;
  const error = errorReferencia || cargaActual?.error || '';

  useEffect(() => {
    if (!parsed) return;
    let activo = true;
    obtenerTextoCapitulo(parsed)
      .then((v) => activo && setCarga({ referencia, versos: v, error: '' }))
      .catch((e) => {
        if (!activo) return;
        setCarga({
          referencia,
          versos: null,
          error: e instanceof BibleError ? e.message : 'Ocurrió un error al cargar el versículo.',
        });
      });
    return () => {
      activo = false;
    };
  }, [parsed, referencia]);

  return (
    <div className="mx-auto w-full max-w-[720px] px-5 pt-3 lg:px-10 lg:pt-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="safe-top -ml-1 mb-4 flex items-center gap-1 text-sm font-semibold text-ink-soft"
      >
        <ChevronLeft size={18} />
        Volver
      </button>

      <span className="eyebrow text-gilt">Reina-Valera 1960</span>
      <h2 className="mt-1.5 font-serif text-[32px] font-medium leading-tight tracking-tight text-ink lg:text-[40px]">
        {referencia || 'Versículo'}
      </h2>

      <div className="mt-5 h-px bg-gilt-light" />

      {cargando && (
        <div className="flex min-h-[120px] items-center justify-center gap-2 text-sm text-ink-muted">
          <Loader2 size={18} className="animate-spin" />
          Cargando texto bíblico…
        </div>
      )}

      {!cargando && error && <p className="py-6 text-sm text-ink-muted">{error}</p>}

      {!cargando && versos && (
        <p className="py-6 font-serif text-xl leading-[1.7] text-ink lg:text-[22px]">
          {versos.map((v) => (
            <span key={v.numero}>
              <sup className="mr-1 text-[12px] font-bold text-gilt">{v.numero}</sup>
              {v.texto}{' '}
            </span>
          ))}
        </p>
      )}

      {estado?.notaId && (
        <Link
          to={`/nota/${estado.notaId}`}
          className="mb-8 flex min-h-[46px] items-center justify-center gap-2 rounded-[10px] border border-line bg-page text-sm font-semibold text-ink hover:bg-paper active:bg-cream-dark/40"
        >
          <NotebookText size={16} />
          Ver en mi nota{estado.fecha ? ` (${estado.fecha})` : ''}
        </Link>
      )}
    </div>
  );
}
