import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookMarked } from 'lucide-react';
import { getNotas } from '../lib/storage';

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
    <div className="px-4 pt-4">
      <h2 className="mb-4 text-xl font-semibold text-bark">Versículos guardados</h2>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bark-light" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar versículo o tema..."
          className="w-full rounded-xl border border-line bg-white py-3 pl-10 pr-4 text-base text-bark focus:border-sage focus:outline-none"
        />
      </div>

      {filtrados.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center text-bark-light">
          <BookMarked size={40} strokeWidth={1.5} />
          <p className="max-w-[260px] text-sm">
            {items.length === 0
              ? 'Aún no has marcado versículos en tus notas.'
              : 'No se encontraron versículos con esa búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map((item) => (
            <Link
              key={item.id}
              to="/versiculo"
              state={{ referencia: item.referencia, notaId: item.notaId, fecha: formatearFecha(item.fecha) }}
              className="block rounded-xl border border-line bg-white p-3.5 active:bg-cream-dark/40"
            >
              <p className="font-semibold text-sage-dark">{item.referencia}</p>
              <p className="mt-0.5 text-xs text-bark-light">
                {formatearFecha(item.fecha)}
                {item.tema ? ` · ${item.tema}` : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
