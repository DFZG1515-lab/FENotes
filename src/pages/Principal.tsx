import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus, RefreshCw, Search, Share2, SlidersHorizontal } from 'lucide-react';
import { EVENTO_NOTAS_CAMBIARON, getNotas } from '../lib/storage';
import { fechaDeHoy, saludo, usePanDeHoy } from '../lib/panDeHoy';
import { extractoNota, fechaMuyCorta, tituloNota } from '../lib/nota';
import { claseBotonBloque } from '../lib/estilos';
import BloqueVino from '../components/BloqueVino';

const RECIENTES = 3;

function fechaCorta(fecha: string): string {
  const texto = new Date(fecha + 'T00:00:00').toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Pantalla principal: versículo del día, botón para anotar y las notas más recientes. */
export default function Principal() {
  const [notas, setNotas] = useState(getNotas);
  const pan = usePanDeHoy();

  useEffect(() => {
    const recargar = () => setNotas(getNotas());
    window.addEventListener(EVENTO_NOTAS_CAMBIARON, recargar);
    return () => window.removeEventListener(EVENTO_NOTAS_CAMBIARON, recargar);
  }, []);

  const recientes = notas.slice(0, RECIENTES);
  // "Para esta semana": los puntos del sermón más reciente que ya tiene resumen.
  const conResumen = notas.find((n) => n.resumen && n.resumen.puntosPrincipales.length > 0);

  function compartirPan() {
    const texto = `“${pan.texto}”\n${pan.referencia}\n\n— Daily Bread`;
    if (navigator.share) navigator.share({ text: texto }).catch(() => {});
    else navigator.clipboard?.writeText(texto);
  }

  return (
    <>
      {/* Celular */}
      <div className="flex flex-col lg:hidden">
        <BloqueVino>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-crema-suave">{fechaDeHoy()}</span>
            <div className="-mr-2 flex gap-1.5">
              <Link to="/notas" state={{ buscar: true }} aria-label="Buscar notas" className={claseBotonBloque}>
                <Search size={17} strokeWidth={1.8} />
              </Link>
              <Link to="/configuracion" aria-label="Configuración" className={claseBotonBloque}>
                <SlidersHorizontal size={17} strokeWidth={1.8} />
              </Link>
            </div>
          </div>
          <h1 className="font-serif text-[36px] font-normal leading-[1.05]">{saludo()}</h1>

          {pan.estado === 'cargando' && <div className="mt-6 h-20 animate-pulse rounded-xl bg-white/10" aria-label="Cargando versículo" />}
          {pan.estado === 'listo' && (
            // Los pasajes largos se recortan; la cita abre el texto completo.
            <Link to="/versiculo" state={{ referencia: pan.referencia }} className="mt-5 flex flex-col active:opacity-80">
              <p className="line-clamp-5 font-serif text-[24px] italic leading-[1.3]">“{pan.texto}”</p>
              <span className="mt-2 font-serif text-base text-oro-claro">{pan.referencia}</span>
            </Link>
          )}
          {pan.estado === 'error' && (
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-sm text-crema-suave">No se pudo cargar el versículo de hoy.</p>
              <button type="button" onClick={pan.reintentar} className={claseBotonBloque} aria-label="Reintentar">
                <RefreshCw size={15} />
              </button>
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <Link
              to="/nueva"
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-crema text-[15px] font-semibold text-vino active:opacity-90"
            >
              <Plus size={16} strokeWidth={2.4} />
              Nueva nota
            </Link>
            {pan.estado === 'listo' && (
              <button type="button" onClick={compartirPan} aria-label="Compartir versículo" className={`${claseBotonBloque} h-12 w-12`}>
                <Share2 size={18} strokeWidth={1.8} />
              </button>
            )}
          </div>
        </BloqueVino>

        <div className="px-6 pt-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-[21px]">Recientes</h2>
            {notas.length > 0 && (
              <Link to="/notas" className="text-[13px] font-semibold text-vino">
                Ver todas
              </Link>
            )}
          </div>
          {recientes.length === 0 ? (
            <p className="py-3 font-serif text-[17px] italic leading-relaxed text-tinta-suave">
              Aún no tienes notas. En el próximo servicio toca Nueva nota; los versículos que menciones se guardan solos.
            </p>
          ) : (
            <ul className="mt-1">
              {recientes.map((nota) => (
                <li key={nota.id} className="border-b border-linea-suave">
                  <Link to={`/nota/${nota.id}`} className="flex flex-col gap-0.5 py-2.5 active:opacity-70">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-serif text-[20px] leading-tight text-ink">{tituloNota(nota)}</span>
                      <span className="shrink-0 text-xs text-gris">{fechaMuyCorta(nota.fecha)}</span>
                    </span>
                    {extractoNota(nota) && (
                      <span className="line-clamp-1 font-serif text-base italic text-tinta-suave">{extractoNota(nota)}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {conResumen && (
            <section className="mt-5 pb-2">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-serif text-[21px]">Para esta semana</h2>
                <Link to={`/nota/${conResumen.id}`} className="truncate text-xs text-gris">
                  {tituloNota(conResumen)}
                </Link>
              </div>
              <ol className="mt-1.5 flex flex-col gap-1.5">
                {conResumen.resumen!.puntosPrincipales.slice(0, 3).map((punto, i) => (
                  <li key={i} className="flex gap-3 font-serif text-[17px] leading-snug text-ink">
                    <span className="w-2.5 shrink-0 text-vino">{i + 1}</span>
                    {punto}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>

      {/* Escritorio */}
      <div className="mx-auto hidden w-full max-w-[640px] flex-col px-10 pb-6 pt-10 lg:flex">
        <div className="flex items-center justify-between">
          <span className="eyebrow text-ink-muted">{fechaDeHoy()}</span>
          <Link
            to="/notas"
            state={{ buscar: true }}
            aria-label="Buscar notas"
            className="-mr-2 flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted active:bg-cream-dark"
          >
            <Search size={18} strokeWidth={1.9} />
          </Link>
        </div>
        <h2 className="mt-1 font-serif text-[32px] font-medium leading-tight tracking-tight text-ink">{saludo()}</h2>

        {/* Pan de hoy */}
        <section className="mt-4 rounded-2xl bg-page px-4 py-4 shadow-[0_1px_2px_rgba(34,28,24,0.06)]">
          <span className="eyebrow text-ribbon">Pan de hoy · {pan.referencia}</span>
          {pan.estado === 'cargando' && <div className="mt-3 h-12 animate-pulse rounded-lg bg-cream-dark/60" aria-label="Cargando versículo" />}
          {pan.estado === 'listo' && (
            <p className="mt-2 font-serif text-[18px] italic leading-[1.45] text-ink">“{pan.texto}”</p>
          )}
          {pan.estado === 'error' && (
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-sm text-ink-muted">No se pudo cargar el versículo. Revisa tu conexión.</p>
              <button
                type="button"
                onClick={pan.reintentar}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink"
              >
                <RefreshCw size={12} />
                Reintentar
              </button>
            </div>
          )}
        </section>

        <Link
          to="/nueva"
          className="mt-4 flex h-14 items-center justify-center gap-2 rounded-2xl bg-ribbon text-base font-semibold text-white shadow-sm shadow-ribbon/30 transition-colors hover:bg-ribbon-dark active:opacity-90"
        >
          <Plus size={18} strokeWidth={2.4} />
          Nueva nota
        </Link>

        {/* Recientes */}
        <div className="mt-7 flex items-baseline justify-between">
          <span className="eyebrow text-ink-muted">Recientes</span>
          {notas.length > 0 && (
            <Link to="/notas" className="text-[13px] font-semibold text-ribbon">
              Ver todas{notas.length > RECIENTES ? ` (${notas.length})` : ''}
            </Link>
          )}
        </div>

        {recientes.length === 0 ? (
          <p className="mt-2 rounded-2xl bg-page px-4 py-5 text-sm leading-relaxed text-ink-muted shadow-[0_1px_2px_rgba(34,28,24,0.06)]">
            Aún no tienes notas. Toca <span className="font-semibold text-ink">Nueva nota</span> en el próximo servicio; los versículos que menciones se
            guardan solos.
          </p>
        ) : (
          <ul className="mt-2 overflow-hidden rounded-2xl bg-page shadow-[0_1px_2px_rgba(34,28,24,0.06)]">
            {recientes.map((nota) => (
              <li key={nota.id} className="border-b border-line last:border-b-0">
                <Link to={`/nota/${nota.id}`} className="flex items-center gap-3 px-4 py-3 active:bg-cream-dark/50">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-ink">{tituloNota(nota)}</span>
                    <span className="block truncate text-[13px] text-ink-muted">
                      {[fechaCorta(nota.fecha), nota.predicador].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-ink-muted" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
