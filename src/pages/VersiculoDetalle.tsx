import { useEffect, useState } from 'react';
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

  const [versos, setVersos] = useState<VersoTexto[] | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const referencia = estado?.referencia ?? '';

  useEffect(() => {
    if (!referencia) {
      setError('No se especificó qué versículo mostrar.');
      setCargando(false);
      return;
    }

    const parsed = parseReferencia(referencia);
    if (!parsed) {
      setError('No pudimos interpretar esta referencia bíblica.');
      setCargando(false);
      return;
    }

    setCargando(true);
    obtenerTextoCapitulo(parsed)
      .then((v) => setVersos(v))
      .catch((e) => setError(e instanceof BibleError ? e.message : 'Ocurrió un error al cargar el versículo.'))
      .finally(() => setCargando(false));
  }, [referencia]);

  return (
    <div className="px-4 pt-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-3 flex items-center gap-1 text-sm font-medium text-bark-light"
      >
        <ChevronLeft size={18} />
        Volver
      </button>

      <h2 className="mb-4 text-xl font-semibold text-bark">{referencia || 'Versículo'}</h2>

      {cargando && (
        <div className="flex min-h-[120px] items-center justify-center gap-2 rounded-2xl border border-line bg-white text-sm text-bark-light">
          <Loader2 size={18} className="animate-spin" />
          Cargando texto bíblico...
        </div>
      )}

      {!cargando && error && (
        <div className="rounded-2xl border border-line bg-white p-4 text-sm text-bark-light">{error}</div>
      )}

      {!cargando && versos && (
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-lg leading-relaxed text-bark">
            {versos.map((v) => (
              <span key={v.numero}>
                <sup className="mr-1 font-semibold text-sage-dark">{v.numero}</sup>
                {v.texto}{' '}
              </span>
            ))}
          </p>
          <p className="mt-4 text-xs text-bark-light">Reina-Valera 1960</p>
        </div>
      )}

      {estado?.notaId && (
        <Link
          to={`/nota/${estado.notaId}`}
          className="mt-4 flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-line bg-white text-sm font-medium text-bark active:bg-cream-dark/40"
        >
          <NotebookText size={16} />
          Ver en mi nota{estado.fecha ? ` (${estado.fecha})` : ''}
        </Link>
      )}
    </div>
  );
}
