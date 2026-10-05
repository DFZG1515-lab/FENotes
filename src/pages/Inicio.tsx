import { useEffect, useMemo, useState } from 'react';
import { useMatch } from 'react-router-dom';
import { Search, NotebookText, Star } from 'lucide-react';
import { deleteNota, EVENTO_NOTAS_CAMBIARON, getNotas } from '../lib/storage';
import NotaCard from '../components/NotaCard';
import SwipeableRow from '../components/SwipeableRow';
import Logo from '../components/Logo';

export default function Inicio() {
  const [notas, setNotas] = useState(getNotas);
  const [busqueda, setBusqueda] = useState('');
  const [filtroChip, setFiltroChip] = useState<string | null>(null);
  const [soloDestacadas, setSoloDestacadas] = useState(false);
  const [notaPendienteEliminar, setNotaPendienteEliminar] = useState<string | null>(null);
  const idAbierta = useMatch('/nota/:id')?.params.id;

  useEffect(() => {
    const recargar = () => setNotas(getNotas());
    window.addEventListener(EVENTO_NOTAS_CAMBIARON, recargar);
    return () => window.removeEventListener(EVENTO_NOTAS_CAMBIARON, recargar);
  }, []);

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
        [n.predicador, n.tema, n.iglesia, n.contenido, n.resumen?.ideaCentral ?? '', ...n.versiculos.map((v) => v.referencia)]
          .join(' ')
          .toLowerCase()
          .includes(q),
      );
    }
    return resultado;
  }, [notas, busqueda, filtroChip, soloDestacadas]);

  const totalDestacadas = notas.filter((n) => n.destacada).length;
  const conteo =
    `${notas.length} ${notas.length === 1 ? 'nota' : 'notas'}` +
    (totalDestacadas > 0 ? ` · ${totalDestacadas} ${totalDestacadas === 1 ? 'destacada' : 'destacadas'}` : '');

  function handleEliminar() {
    if (!notaPendienteEliminar) return;
    deleteNota(notaPendienteEliminar);
    setNotaPendienteEliminar(null);
  }

  const claseChip = (activo: boolean) =>
    `flex h-[30px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-medium transition-colors ${
      activo ? 'border-ribbon bg-ribbon/10 text-ribbon' : 'border-line bg-page text-ink-muted hover:bg-cream-dark/40'
    }`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-baseline justify-between px-5 pb-2.5 pt-3 lg:px-6 lg:pt-7">
        <h2 className="font-serif text-[30px] font-medium tracking-tight text-ink lg:text-[28px]">Notas</h2>
        <span className="text-[13px] text-ink-muted">{conteo}</span>
      </div>

      <div className="relative px-5 pb-2.5 lg:px-4">
        <label htmlFor="buscar-notas" className="sr-only">
          Buscar notas
        </label>
        <Search size={16} className="pointer-events-none absolute left-8 top-1/2 -translate-y-[calc(50%+5px)] text-ink-muted lg:left-7" />
        <input
          id="buscar-notas"
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Predicador, tema o versículo"
          className="h-[42px] w-full rounded-[10px] border border-line bg-page pl-9 pr-3 text-base text-ink placeholder:text-ink-muted/70 focus:border-gilt-light focus:outline-none lg:h-10 lg:text-sm"
        />
      </div>

      {(chips.length > 0 || totalDestacadas > 0) && (
        <div className="scroll-x flex gap-1.5 overflow-x-auto px-5 pb-3 lg:flex-wrap lg:px-4">
          {totalDestacadas > 0 && (
            <button type="button" onClick={() => setSoloDestacadas((v) => !v)} className={claseChip(soloDestacadas)}>
              <Star size={11} fill={soloDestacadas ? 'currentColor' : 'none'} />
              Destacadas
            </button>
          )}
          {chips.map((valor) => (
            <button
              key={valor}
              type="button"
              onClick={() => setFiltroChip((actual) => (actual === valor ? null : valor))}
              className={claseChip(filtroChip === valor)}
            >
              {valor}
            </button>
          ))}
        </div>
      )}

      <div className="min-h-0 flex-1 px-4 pb-6 lg:overflow-y-auto lg:px-3 lg:pb-4">
        {filtradas.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 px-4 text-center">
            {notas.length === 0 ? (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-page text-gilt">
                  <Logo size={26} />
                </div>
                <div>
                  <p className="font-serif text-xl font-medium text-ink">Tu primera nota te espera</p>
                  <p className="mt-1.5 max-w-[260px] text-sm leading-relaxed text-ink-muted">
                    Anota lo que Dios te habla en cada servicio. Los versículos que menciones aparecerán al margen.
                  </p>
                </div>
              </>
            ) : (
              <>
                <NotebookText size={34} strokeWidth={1.5} className="text-ink-muted/50" />
                <p className="max-w-[240px] text-sm text-ink-muted">No hay notas que coincidan con esa búsqueda.</p>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 lg:gap-1">
            {filtradas.map((nota) => (
              <SwipeableRow key={nota.id} onDelete={() => setNotaPendienteEliminar(nota.id)}>
                <NotaCard nota={nota} seleccionada={nota.id === idAbierta} />
              </SwipeableRow>
            ))}
          </div>
        )}
      </div>

      {notaPendienteEliminar && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 px-4 pb-28 lg:items-center lg:pb-0">
          <div className="w-full max-w-[400px] rounded-2xl bg-page p-5 shadow-xl shadow-ink/20">
            <h3 className="font-serif text-xl font-medium text-ink">¿Eliminar esta nota?</h3>
            <p className="mt-1 text-sm text-ink-muted">Esta acción no se puede deshacer.</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setNotaPendienteEliminar(null)}
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
