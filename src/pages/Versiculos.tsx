import { useMemo, useState } from 'react';
import { Search, BookMarked } from 'lucide-react';
import { getNotas } from '../lib/storage';
import VersiculoMargen from '../components/VersiculoMargen';

function formatearFecha(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Versiculos() {
  const [busqueda, setBusqueda] = useState('');

  const items = useMemo(() => {
    const notas = getNotas();
    const lista: { id: string; referencia: string; notaId: string; fecha: string; tema: string }[] = [];
    for (const nota of notas) {
      for (const v of nota.versiculos) {
        lista.push({ id: v.id, referencia: v.referencia, notaId: nota.id, fecha: nota.fecha, tema: nota.tema });
      }
    }
    return lista;
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.referencia.toLowerCase().includes(q) || i.tema.toLowerCase().includes(q));
  }, [items, busqueda]);

  return (
    <div className="mx-auto w-full max-w-[720px] px-5 pt-3 lg:px-10 lg:pt-8">
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
          className="h-[42px] w-full rounded-[10px] border border-line bg-page pl-9 pr-3 text-base text-ink placeholder:text-ink-muted/70 focus:border-gilt-light focus:outline-none lg:h-10 lg:text-sm"
        />
      </div>

      {filtrados.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center text-ink-muted">
          <BookMarked size={36} strokeWidth={1.5} />
          <p className="max-w-[260px] text-sm">
            {items.length === 0
              ? 'Aún no has mencionado versículos en tus notas. Aparecerán aquí solos al escribirlos.'
              : 'No hay versículos que coincidan con esa búsqueda.'}
          </p>
        </div>
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
  );
}
