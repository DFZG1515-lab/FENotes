import { useMemo, useState } from 'react';
import { Search, NotebookText, Star } from 'lucide-react';
import { deleteNota, getNotas, getTotalNotas } from '../lib/storage';
import NotaCard from '../components/NotaCard';
import SwipeableRow from '../components/SwipeableRow';

export default function Inicio() {
  const [recargarTick, setRecargarTick] = useState(0);
  const notas = useMemo(() => getNotas(), [recargarTick]);
  const total = useMemo(() => getTotalNotas(), [recargarTick]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroChip, setFiltroChip] = useState<string | null>(null);
  const [soloDestacadas, setSoloDestacadas] = useState(false);
  const [notaPendienteEliminar, setNotaPendienteEliminar] = useState<string | null>(null);

  const chips = useMemo(() => {
    const valores = new Set<string>();
    notas.forEach((n) => {
      if (n.predicador) valores.add(n.predicador);
      if (n.iglesia) valores.add(n.iglesia);
    });
    return Array.from(valores).slice(0, 10);
  }, [notas]);

  const filtradas = useMemo(() => {
    let resultado = notas;
    if (soloDestacadas) resultado = resultado.filter((n) => n.destacada);
    if (filtroChip) resultado = resultado.filter((n) => n.predicador === filtroChip || n.iglesia === filtroChip);
    const q = busqueda.trim().toLowerCase();
    if (q) {
      resultado = resultado.filter((n) =>
        [n.predicador, n.tema, n.iglesia, n.contenido, n.resumen?.ideaCentral ?? '']
          .join(' ')
          .toLowerCase()
          .includes(q),
      );
    }
    return resultado;
  }, [notas, busqueda, filtroChip, soloDestacadas]);

  function handleEliminar() {
    if (!notaPendienteEliminar) return;
    deleteNota(notaPendienteEliminar);
    setNotaPendienteEliminar(null);
    setRecargarTick((t) => t + 1);
  }

  return (
    <div className="px-4 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-bark-light">
          {total} {total === 1 ? 'nota tomada' : 'notas tomadas'}
        </p>
      </div>

      <div className="relative mb-3">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bark-light" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por predicador, tema, lugar..."
          className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-4 text-base text-bark focus:border-sage focus:outline-none"
        />
      </div>

      {(chips.length > 0 || notas.some((n) => n.destacada)) && (
        <div className="mb-4 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {notas.some((n) => n.destacada) && (
            <button
              type="button"
              onClick={() => setSoloDestacadas((v) => !v)}
              className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium ${
                soloDestacadas ? 'border-clay bg-clay/10 text-clay' : 'border-line bg-surface text-bark-light'
              }`}
            >
              <Star size={12} fill={soloDestacadas ? 'currentColor' : 'none'} />
              Destacadas
            </button>
          )}
          {chips.map((valor) => (
            <button
              key={valor}
              type="button"
              onClick={() => setFiltroChip((actual) => (actual === valor ? null : valor))}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
                filtroChip === valor ? 'border-sage bg-sage/10 text-sage-dark' : 'border-line bg-surface text-bark-light'
              }`}
            >
              {valor}
            </button>
          ))}
        </div>
      )}

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
            <SwipeableRow key={nota.id} onDelete={() => setNotaPendienteEliminar(nota.id)}>
              <NotaCard nota={nota} />
            </SwipeableRow>
          ))}
        </div>
      )}

      {notaPendienteEliminar && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-bark/40 px-4 pb-28">
          <div className="w-full max-w-[400px] rounded-2xl bg-surface p-5">
            <h3 className="text-base font-semibold text-bark">¿Eliminar esta nota?</h3>
            <p className="mt-1 text-sm text-bark-light">Esta acción no se puede deshacer.</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setNotaPendienteEliminar(null)}
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
