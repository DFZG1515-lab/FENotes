import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { parseReferencia } from '../lib/bibleRef';
import { obtenerTextoCapitulo } from '../lib/bible';

type Variante = 'margen' | 'tarjeta' | 'chip';

interface Enlace {
  notaId?: string;
  fecha?: string;
  tema?: string;
}

interface Props {
  referencia: string;
  variante?: Variante;
  /** Si se indica, el bloque enlaza a la lectura completa del versículo. */
  enlace?: Enlace;
  /** Texto pequeño bajo el versículo (p. ej. fecha · tema). */
  subtitulo?: string;
  /** Resalta el borde con el listón (p. ej. recién detectado). */
  resaltado?: boolean;
  onRemove?: () => void;
}

const cacheTextos = new Map<string, Promise<string>>();

function textoDe(referencia: string): Promise<string> {
  const clave = referencia.trim().toLowerCase();
  let promesa = cacheTextos.get(clave);
  if (!promesa) {
    const parsed = parseReferencia(referencia);
    promesa = parsed
      ? obtenerTextoCapitulo(parsed).then((versos) => versos.map((v) => v.texto).join(' '))
      : Promise.resolve('');
    cacheTextos.set(clave, promesa);
  }
  return promesa;
}

/** Referencia bíblica con su texto, como una nota al margen de una Biblia. */
export default function VersiculoMargen({
  referencia,
  variante = 'margen',
  enlace,
  subtitulo,
  resaltado = false,
  onRemove,
}: Props) {
  const [resultado, setResultado] = useState<{ referencia: string; texto: string } | null>(null);
  // Mientras la referencia cargada no coincida con la actual, mostramos el esqueleto de carga.
  const texto = resultado?.referencia === referencia ? resultado.texto : null;

  useEffect(() => {
    if (variante === 'chip') return;
    let activo = true;
    textoDe(referencia)
      .then((t) => activo && setResultado({ referencia, texto: t }))
      .catch(() => activo && setResultado({ referencia, texto: '' }));
    return () => {
      activo = false;
    };
  }, [referencia, variante]);

  const botonQuitar = onRemove && (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove();
      }}
      aria-label={`Quitar ${referencia}`}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-muted hover:bg-cream-dark active:bg-cream-dark"
    >
      <X size={14} strokeWidth={2.2} />
    </button>
  );

  if (variante === 'chip') {
    return (
      <span
        className={`inline-flex h-[34px] shrink-0 items-center gap-1 whitespace-nowrap rounded-full border bg-page pl-3 text-[13px] font-bold text-gilt ${
          onRemove ? 'pr-1' : 'pr-3'
        } ${resaltado ? 'border-ribbon' : 'border-line'}`}
      >
        {referencia}
        {botonQuitar}
      </span>
    );
  }

  const cuerpo = (
    <>
      <span className="flex items-center gap-2 text-[13px] font-bold text-gilt">
        {referencia}
        {resaltado && (
          <span className="rounded-full bg-ribbon px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            Nuevo
          </span>
        )}
      </span>
      {texto === null ? (
        <span className="mt-1.5 block h-3 w-3/4 animate-pulse rounded bg-line" />
      ) : texto ? (
        <span
          className={`mt-1 font-serif text-[14.5px] italic leading-[1.45] text-ink-soft ${
            variante === 'tarjeta' ? 'line-clamp-4 lg:line-clamp-none' : 'block'
          }`}
        >
          {texto}
        </span>
      ) : null}
      {subtitulo && <span className="mt-1 block text-xs text-ink-muted">{subtitulo}</span>}
    </>
  );

  // 'tarjeta' es una tarjeta horizontal en celular y se convierte en fila de margen en escritorio.
  const claseContenedor =
    variante === 'tarjeta'
      ? `block w-[220px] shrink-0 rounded-xl border bg-paper px-3.5 py-3 lg:w-auto lg:shrink lg:rounded-none lg:border-0 lg:border-b lg:border-line lg:bg-transparent lg:px-0 lg:py-2.5 ${
          resaltado ? 'border-ribbon' : 'border-line'
        }`
      : `block border-b border-line py-2.5 ${resaltado ? '-mx-2 rounded-t-lg bg-paper px-2' : ''}`;

  const interior = onRemove ? (
    <span className="flex items-start gap-2">
      <span className="min-w-0 flex-1">{cuerpo}</span>
      {botonQuitar}
    </span>
  ) : (
    cuerpo
  );

  if (enlace) {
    return (
      <Link
        to="/versiculo"
        state={{ referencia, ...enlace }}
        className={`${claseContenedor} transition-colors hover:bg-paper active:bg-cream-dark`}
      >
        {interior}
      </Link>
    );
  }

  return <div className={claseContenedor}>{interior}</div>;
}
