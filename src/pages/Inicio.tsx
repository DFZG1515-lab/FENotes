import { useMemo, useState } from 'react';
import { Search, NotebookText } from 'lucide-react';
import { getNotas, getTotalNotas } from '../lib/storage';
import NotaCard from '../components/NotaCard';

export default function Inicio() {
  const notas = useMemo(() => getNotas(), []);
  const total = useMemo(() => getTotalNotas(), []);
  const [busqueda, setBusqueda] = useState('');

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return notas;
    return notas.filter((n) =>
      [n.predicador, n.tema, n.iglesia, n.contenido, n.resumen?.ideaCentral ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [notas, busqueda]);

  return (
    <div className="px-4 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-bark-light">
          {total} {total === 1 ? 'nota tomada' : 'notas tomadas'}
        </p>
      </div>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bark-light" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por predicador, tema, lugar..."
          className="w-full rounded-xl border border-line bg-white py-3 pl-10 pr-4 text-base text-bark focus:border-sage focus:outline-none"
        />
      </div>

      {filtradas.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center text-bark-light">
          <NotebookText size={40} strokeWidth={1.5} />
          <p className="max-w-[260px] text-sm">
            {notas.length === 0
              ? 'Aún no tienes notas. Toca el botón + para crear la primera.'
              : 'No se encontraron notas con esa búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtradas.map((nota) => (
            <NotaCard key={nota.id} nota={nota} />
          ))}
        </div>
      )}
    </div>
  );
}
