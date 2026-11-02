import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookMarked } from 'lucide-react';
import { getNotas } from '../lib/storage';
import { normalizarReferencia } from '../lib/versiculos';
import { useTextoVersiculo } from '../lib/textoVersiculo';
import { claseBuscadorBloque } from '../lib/estilos';
import VersiculoMargen from '../components/VersiculoMargen';
import BloqueVino from '../components/BloqueVino';

function formatearFecha(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface Item {
  id: string;
  referencia: string;
  notaId: string;
  fecha: string;
  tema: string;
}

/** Una cita con todas las notas donde aparece; la primera es la más reciente. */
interface Cita {
  referencia: string;
  apariciones: Item[];
}

function notasTexto(n: number): string {
  return `${n} ${n === 1 ? 'nota' : 'notas'}`;
}

function FilaCita({ cita }: { cita: Cita }) {
  const texto = useTextoVersiculo(cita.referencia);
  const ultima = cita.apariciones[0];
  return (
    <Link
      to="/versiculo"
      state={{ referencia: cita.referencia, notaId: ultima.notaId, fecha: formatearFecha(ultima.fecha), tema: ultima.tema }}
      className="flex flex-col gap-0.5 border-b border-linea-suave py-3 active:opacity-70"
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="font-serif text-[18px] text-vino">{cita.referencia}</span>
        <span className="shrink-0 text-xs text-gris">{notasTexto(cita.apariciones.length)}</span>
      </span>
      {texto === null ? (
        <span className="mt-1 block h-3 w-3/4 animate-pulse rounded bg-linea-suave" />
      ) : (
        texto && <span className="line-clamp-2 font-serif text-[17px] italic leading-snug text-tinta-suave">{texto}</span>
      )}
    </Link>
  );
}

export default function Versiculos() {
  const [busqueda, setBusqueda] = useState('');

  const items = useMemo(() => {
    const notas = getNotas();
    const lista: Item[] = [];
    for (const nota of notas) {
      for (const v of nota.versiculos) {
        lista.push({ id: v.id, referencia: v.referencia, notaId: nota.id, fecha: nota.fecha, tema: nota.tema });
      }
    }
    return lista;
  }, []);

  // En celular cada cita aparece una vez, ordenada por cuántas notas la mencionan.
  const citas = useMemo(() => {
    const porClave = new Map<string, Cita>();
    for (const item of items) {
      const clave = normalizarReferencia(item.referencia);
      const cita = porClave.get(clave);
      if (cita) cita.apariciones.push(item);
      else porClave.set(clave, { referencia: item.referencia, apariciones: [item] });
    }
    return [...porClave.values()].sort((a, b) => b.apariciones.length - a.apariciones.length);
  }, [items]);

  const q = busqueda.trim().toLowerCase();

  const filtrados = useMemo(() => {
    if (!q) return items;
    return items.filter((i) => i.referencia.toLowerCase().includes(q) || i.tema.toLowerCase().includes(q));
  }, [items, q]);

  const citasFiltradas = useMemo(() => {
    if (!q) return citas;
    return citas.filter(
      (c) => c.referencia.toLowerCase().includes(q) || c.apariciones.some((a) => a.tema.toLowerCase().includes(q)),
    );
  }, [citas, q]);

  const masCitada = citas[0]?.apariciones.length > 1 ? citas[0] : undefined;
  const textoMasCitada = useTextoVersiculo(masCitada?.referencia);

  const vacio = (
    <div className="mt-16 flex flex-col items-center gap-3 px-6 text-center text-ink-muted">
      <BookMarked size={36} strokeWidth={1.5} />
      <p className="max-w-[260px] text-sm">
        {items.length === 0
          ? 'Aún no has mencionado versículos en tus notas. Aparecerán aquí solos al escribirlos.'
          : 'No hay versículos que coincidan con esa búsqueda.'}
      </p>
    </div>
  );

  return (
    <>
      {/* Celular */}
      <div className="flex flex-col lg:hidden">
        <BloqueVino>
          <div className="flex items-baseline justify-between">
            <h1 className="font-serif text-[36px] font-normal leading-[1.05]">Versículos</h1>
            <span className="text-[13px] text-crema-suave">
              {citas.length} {citas.length === 1 ? 'cita' : 'citas'}
            </span>
          </div>
          <div className="relative mt-4">
            <label htmlFor="buscar-versiculos-movil" className="sr-only">
              Buscar versículo o tema
            </label>
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-crema-suave" />
            <input
              id="buscar-versiculos-movil"
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Libro o cita, p. ej. Juan 6"
              className={claseBuscadorBloque}
            />
          </div>
          {masCitada && !q && textoMasCitada !== '' && (
            <div className="mt-4 flex flex-col gap-1">
              <span className="text-xs text-crema-suave">Tu más citado</span>
              {textoMasCitada === null ? (
                <span className="h-12 animate-pulse rounded-xl bg-white/10" />
              ) : (
                <span className="line-clamp-3 font-serif text-[21px] italic leading-snug">“{textoMasCitada}”</span>
              )}
              <span className="font-serif text-[15px] text-oro-claro">
                {masCitada.referencia} · en {notasTexto(masCitada.apariciones.length)}
              </span>
            </div>
          )}
        </BloqueVino>

        {citasFiltradas.length === 0 ? (
          vacio
        ) : (
          <div className="px-6 pb-6 pt-1">
            {citasFiltradas.map((cita) => (
              <FilaCita key={normalizarReferencia(cita.referencia)} cita={cita} />
            ))}
          </div>
        )}
      </div>

      {/* Escritorio */}
      <div className="mx-auto hidden w-full max-w-[720px] px-10 pt-8 lg:block">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-[30px] font-medium tracking-tight text-ink">Versículos</h2>
          <span className="text-[13px] text-ink-muted">
            {items.length} {items.length === 1 ? 'guardado' : 'guardados'}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-muted">Todo lo que has mencionado en tus notas, listo para volver a leer.</p>

        <div className="relative mb-2 mt-4">
          <label htmlFor="buscar-versiculos" className="sr-only">
            Buscar versículo o tema
          </label>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            id="buscar-versiculos"
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar versículo o tema"
            className="h-10 w-full rounded-[10px] border border-line bg-page pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted/70 focus:border-gilt-light focus:outline-none"
          />
        </div>

        {filtrados.length === 0 ? (
          vacio
        ) : (
          <div className="pb-8">
            <div className="eyebrow flex items-center gap-2 pt-3 text-gilt">
              <span>Al margen</span>
              <span className="h-px flex-1 bg-gilt-light" />
            </div>
            {filtrados.map((item) => (
              <VersiculoMargen
                key={item.id}
                referencia={item.referencia}
                variante="margen"
                enlace={{ notaId: item.notaId, fecha: formatearFecha(item.fecha), tema: item.tema }}
                subtitulo={`${formatearFecha(item.fecha)}${item.tema ? ` · ${item.tema}` : ''}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
