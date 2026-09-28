import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, ChevronLeft, Loader2, Plus, Send, Sparkles } from 'lucide-react';
import VersiculoMargen from '../components/VersiculoMargen';
import Logo from '../components/Logo';
import { AsistenteError, enviarMensajeEnNota } from '../lib/asistente';
import type { MensajeChat } from '../types';
import {
  getBorrador,
  getNota,
  getPredicadoresUsados,
  getUltimaIglesia,
  guardarBorrador,
  limpiarBorrador,
  saveNota,
} from '../lib/storage';
import { generarId } from '../lib/id';
import { detectarVersiculos, normalizarReferencia } from '../lib/versiculos';
import { sincronizarWidgetSilencioso } from '../lib/widgetSync';
import type { Nota, Versiculo } from '../types';

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function notaVacia(): Nota {
  return {
    id: generarId(),
    fecha: hoyISO(),
    iglesia: getUltimaIglesia(),
    predicador: '',
    tema: '',
    contenido: '',
    versiculos: [],
    resumen: null,
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
  };
}

function formatearFechaCorta(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
}

const claseCampo =
  'h-9 w-full border-0 border-b border-line bg-transparent text-[15px] text-ink placeholder:text-ink-muted/60 focus:border-gilt-light focus:outline-none';

export default function NuevaNota() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [nota, setNota] = useState<Nota>(() => {
    if (editando) {
      const existente = getNota(id!);
      if (existente) return existente;
    }
    const borrador = !editando ? getBorrador() : null;
    return borrador ? { ...notaVacia(), ...borrador } : notaVacia();
  });
  const [nuevoVersiculo, setNuevoVersiculo] = useState('');
  const [metaAbierta, setMetaAbierta] = useState(false);
  const [ultimoDetectado, setUltimoDetectado] = useState<string | null>(null);
  const [predicadoresUsados] = useState(getPredicadoresUsados);
  const ignorados = useRef(new Set<string>());
  const autoDetectados = useRef(new Set<string>());

  // Chat de IA dentro de la nota
  const [chatAbierto, setChatAbierto] = useState(false);
  const [chatMensajes, setChatMensajes] = useState<MensajeChat[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatCargando, setChatCargando] = useState(false);
  const [chatError, setChatError] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [chatMensajes, chatCargando]);

  async function handleChatEnviar() {
    const pregunta = chatInput.trim();
    if (!pregunta || chatCargando) return;
    const msgUsuario: MensajeChat = { id: generarId(), rol: 'usuario', contenido: pregunta };
    setChatMensajes((prev) => [...prev, msgUsuario]);
    setChatInput('');
    setChatError('');
    setChatCargando(true);
    setChatAbierto(true);
    try {
      const respuesta = await enviarMensajeEnNota(pregunta, chatMensajes, {
        predicador: nota.predicador,
        tema: nota.tema,
        contenido: nota.contenido,
        versiculos: nota.versiculos.map((v) => v.referencia),
      });
      setChatMensajes((prev) => [...prev, { id: generarId(), rol: 'asistente', contenido: respuesta }]);
    } catch (e) {
      setChatError(e instanceof AsistenteError ? e.message : 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setChatCargando(false);
    }
  }

  useEffect(() => {
    if (!editando) guardarBorrador(nota);
  }, [nota, editando]);

  useEffect(() => {
    const detectados = detectarVersiculos(nota.contenido);
    const clavesDetectadas = new Set(detectados.map((ref) => normalizarReferencia(ref)));
    setNota((prev) => {
      // Quita los auto-detectados que ya no coinciden con el texto actual (p.ej. referencias parciales
      // mientras el usuario aún está escribiendo). Los agregados manualmente nunca se tocan aquí.
      const versiculos = prev.versiculos.filter((v) => {
        const clave = normalizarReferencia(v.referencia);
        if (autoDetectados.current.has(clave) && !clavesDetectadas.has(clave)) {
          autoDetectados.current.delete(clave);
          return false;
        }
        return true;
      });
      const existentes = new Set(versiculos.map((v) => normalizarReferencia(v.referencia)));
      const nuevos = detectados.filter((ref) => {
        const clave = normalizarReferencia(ref);
        return !existentes.has(clave) && !ignorados.current.has(clave);
      });
      if (nuevos.length === 0 && versiculos.length === prev.versiculos.length) return prev;
      const versiculosNuevos: Versiculo[] = nuevos.map((referencia) => {
        autoDetectados.current.add(normalizarReferencia(referencia));
        return { id: generarId(), referencia };
      });
      if (versiculosNuevos.length > 0) setUltimoDetectado(versiculosNuevos[versiculosNuevos.length - 1].id);
      return { ...prev, versiculos: [...versiculos, ...versiculosNuevos] };
    });
  }, [nota.contenido]);

  function actualizar<K extends keyof Nota>(campo: K, valor: Nota[K]) {
    setNota((prev) => ({ ...prev, [campo]: valor }));
  }

  function agregarVersiculo() {
    const ref = nuevoVersiculo.trim();
    if (!ref) return;
    setNota((prev) => ({ ...prev, versiculos: [...prev.versiculos, { id: generarId(), referencia: ref }] }));
    setNuevoVersiculo('');
  }

  function quitarVersiculo(versId: string) {
    setNota((prev) => {
      const versiculo = prev.versiculos.find((v) => v.id === versId);
      if (versiculo) {
        const clave = normalizarReferencia(versiculo.referencia);
        ignorados.current.add(clave);
        autoDetectados.current.delete(clave);
      }
      return { ...prev, versiculos: prev.versiculos.filter((v) => v.id !== versId) };
    });
  }

  function guardar() {
    const final: Nota = { ...nota, actualizadoEn: new Date().toISOString() };
    saveNota(final);
    sincronizarWidgetSilencioso();
    if (!editando) limpiarBorrador();
    navigate(`/nota/${final.id}`);
  }

  const puedeGuardar = nota.contenido.trim().length > 0;
  const rutaCancelar = editando ? `/nota/${id}` : '/notas';
  const resumenMeta = [
    formatearFechaCorta(nota.fecha),
    nota.iglesia || 'Sin iglesia',
    nota.predicador || 'Sin predicador',
    nota.tema || 'sin tema',
  ];

  const campos = (
    <>
      <div className="flex flex-col gap-1">
        <label htmlFor="fecha" className="eyebrow text-ink-muted">
          Fecha
        </label>
        <input id="fecha" type="date" value={nota.fecha} onChange={(e) => actualizar('fecha', e.target.value)} className={claseCampo} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="iglesia" className="eyebrow text-ink-muted">
          Iglesia
        </label>
        <input
          id="iglesia"
          list="sugerencias-iglesia"
          value={nota.iglesia}
          onChange={(e) => actualizar('iglesia', e.target.value)}
          placeholder="Iglesia o lugar"
          className={claseCampo}
        />
        <datalist id="sugerencias-iglesia">
          <option value={getUltimaIglesia()} />
        </datalist>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="predicador" className="eyebrow text-ink-muted">
          Predicador
        </label>
        <input
          id="predicador"
          list="sugerencias-predicador"
          value={nota.predicador}
          onChange={(e) => actualizar('predicador', e.target.value)}
          placeholder="Quién predicó"
          className={claseCampo}
        />
        <datalist id="sugerencias-predicador">
          {predicadoresUsados.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="tema" className="eyebrow text-ink-muted">
          Tema
        </label>
        <input id="tema" value={nota.tema} onChange={(e) => actualizar('tema', e.target.value)} placeholder="Opcional" className={claseCampo} />
      </div>
    </>
  );

  const chatMensajesUI = (
    <>
      {chatMensajes.length === 0 && !chatCargando && (
        <p className="px-1 text-xs leading-relaxed text-ink-muted">
          Pregunta sobre un versículo, el tema del sermón o cualquier cosa que no entiendas mientras anotas.
        </p>
      )}
      {chatMensajes.map((m) => (
        <div key={m.id} className={`flex ${m.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[88%] px-3 py-2 text-[13px] leading-relaxed ${
              m.rol === 'usuario'
                ? 'rounded-[12px_12px_2px_12px] bg-ribbon text-white'
                : 'rounded-[12px_12px_12px_2px] border border-line bg-page text-ink'
            }`}
          >
            {m.contenido}
          </div>
        </div>
      ))}
      {chatCargando && (
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <Loader2 size={13} className="animate-spin" />
          Pensando…
        </div>
      )}
      {chatError && <p className="text-xs text-[#7f2e2e]">{chatError}</p>}
      <div ref={chatBottomRef} />
    </>
  );

  const chatInputUI = (
    <div className="flex gap-1.5">
      <label htmlFor="pregunta-ia" className="sr-only">
        Pregunta a la IA
      </label>
      <div className="relative min-w-0 flex-1">
        <Sparkles size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gilt" />
        <input
          id="pregunta-ia"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onFocus={() => setChatAbierto(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleChatEnviar();
            }
          }}
          placeholder="Pregunta mientras anotas"
          className="h-10 w-full rounded-lg border border-line bg-page pl-8 pr-3 text-[13px] text-ink placeholder:text-ink-muted/70 focus:border-gilt-light focus:outline-none lg:h-9"
        />
      </div>
      <button
        type="button"
        onClick={handleChatEnviar}
        disabled={!chatInput.trim() || chatCargando}
        aria-label="Enviar pregunta"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink text-page disabled:opacity-40 lg:h-9 lg:w-9"
      >
        <Send size={15} />
      </button>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-page lg:h-dvh lg:border-t-[3px] lg:border-gilt-light">
      {/* Barra superior */}
      <header className="safe-top sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-line bg-page/95 px-5 backdrop-blur lg:static lg:h-16 lg:px-8">
        <Link to={rutaCancelar} className="flex items-center gap-1 text-[15px] font-medium text-ink-soft lg:text-sm lg:font-semibold">
          <ChevronLeft size={16} className="hidden lg:block" />
          <span className="lg:hidden">Cancelar</span>
          <span className="hidden lg:inline">{editando ? 'Volver a la nota' : 'Notas'}</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Logo size={18} className="hidden text-ink lg:block" />
          <span className="font-serif text-[17px] font-medium text-ink lg:text-lg">{editando ? 'Editar nota' : 'Nueva nota'}</span>
        </div>

        <div className="flex items-center gap-3.5">
          {!editando && <span className="hidden text-[13px] text-ink-muted lg:inline">Borrador guardado</span>}
          <button
            type="button"
            disabled={!puedeGuardar}
            onClick={guardar}
            className="h-9 rounded-full bg-ribbon px-4 text-sm font-semibold text-white hover:bg-ribbon-dark disabled:opacity-40 lg:h-10 lg:rounded-[10px] lg:px-[18px]"
          >
            <span className="lg:hidden">Guardar</span>
            <span className="hidden lg:inline">Guardar nota</span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col pb-[calc(200px+env(safe-area-inset-bottom))] lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-x-12 lg:px-16 lg:pb-8 lg:pt-7">
        {/* Columna de escritura */}
        <div className="flex min-h-0 flex-col px-5 pt-4 lg:px-0 lg:pt-0">
          <button
            type="button"
            onClick={() => setMetaAbierta((v) => !v)}
            aria-expanded={metaAbierta}
            className="flex w-full items-center justify-between rounded-[10px] border border-line bg-paper px-3.5 py-3 text-left lg:hidden"
          >
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="eyebrow truncate text-ink-muted">
                {resumenMeta[0]} · {resumenMeta[1]}
              </span>
              <span className="truncate text-sm font-semibold text-ink">
                {resumenMeta[2]} · {resumenMeta[3]}
              </span>
            </span>
            <ChevronDown size={16} className={`shrink-0 text-ink-muted transition-transform ${metaAbierta ? 'rotate-180' : ''}`} />
          </button>

          <div
            className={`${
              metaAbierta ? 'grid' : 'hidden'
            } mt-3 grid-cols-1 gap-3 rounded-[10px] border border-line bg-paper p-3.5 lg:mt-0 lg:grid lg:grid-cols-[150px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0`}
          >
            {campos}
          </div>

          <label htmlFor="contenido" className="sr-only">
            Notas del sermón
          </label>
          <textarea
            id="contenido"
            value={nota.contenido}
            onChange={(e) => actualizar('contenido', e.target.value)}
            placeholder="Ve anotando libremente lo que el predicador comparte…"
            className="mt-3 min-h-[46vh] w-full resize-none border-0 bg-transparent font-serif text-[19px] leading-[1.6] text-ink placeholder:text-ink-muted/60 focus:outline-none lg:mt-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:text-xl lg:leading-[1.65]"
          />
          <p className="mt-2 hidden text-xs text-ink-muted lg:block">
            Escribe libremente. Cuando menciones un versículo, aparecerá al margen con su texto.
          </p>
        </div>

        {/* Margen (escritorio) */}
        <aside className="hidden min-h-0 flex-col gap-5 overflow-y-auto lg:flex">
          <div>
            <div className="eyebrow mb-1 flex items-center gap-2 text-gilt">
              <span>Al margen</span>
              <span className="h-px flex-1 bg-gilt-light" />
              <span className="font-medium normal-case tracking-normal text-ink-muted">
                {nota.versiculos.length} {nota.versiculos.length === 1 ? 'detectado' : 'detectados'}
              </span>
            </div>
            {nota.versiculos.length === 0 && (
              <p className="py-2.5 text-[13px] leading-relaxed text-ink-muted">
                Los versículos que escribas (ej. Juan 3:16) aparecerán aquí solos.
              </p>
            )}
            {nota.versiculos.map((v) => (
              <VersiculoMargen
                key={v.id}
                referencia={v.referencia}
                variante="margen"
                resaltado={v.id === ultimoDetectado}
                onRemove={() => quitarVersiculo(v.id)}
              />
            ))}
            <div className="mt-2.5 flex gap-1.5">
              <label htmlFor="agregar-versiculo" className="sr-only">
                Agregar versículo
              </label>
              <input
                id="agregar-versiculo"
                value={nuevoVersiculo}
                onChange={(e) => setNuevoVersiculo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    agregarVersiculo();
                  }
                }}
                placeholder="Agregar, ej. Romanos 8:28"
                className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-page px-3 text-[13px] text-ink placeholder:text-ink-muted/70 focus:border-gilt-light focus:outline-none"
              />
              <button
                type="button"
                onClick={agregarVersiculo}
                className="h-9 rounded-lg border border-line bg-paper px-3 text-[13px] font-semibold text-ink-soft hover:bg-cream-dark/50"
              >
                Agregar
              </button>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-paper">
            <div className="flex items-center gap-2 border-b border-line px-3.5 py-3 text-[13px] font-bold text-ink">
              <Sparkles size={14} className="text-gilt" />
              Pregunta mientras anotas
            </div>
            <div className="flex max-h-72 flex-col gap-2.5 overflow-y-auto p-3.5">{chatMensajesUI}</div>
            <div className="px-2.5 pb-2.5">{chatInputUI}</div>
          </div>
        </aside>
      </div>

      {/* Panel inferior (celular): versículos al margen + pregunta a la IA */}
      <div
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper lg:hidden"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
      >
        {chatAbierto && (chatMensajes.length > 0 || chatCargando || chatError) && (
          <div className="flex max-h-56 flex-col gap-2.5 overflow-y-auto border-b border-line px-5 py-3">{chatMensajesUI}</div>
        )}
        <div className="eyebrow flex items-center gap-2 px-5 pb-2 pt-2.5 text-gilt">
          <span>Al margen</span>
          <span className="font-medium normal-case tracking-normal text-ink-muted">
            {nota.versiculos.length} {nota.versiculos.length === 1 ? 'detectado' : 'detectados'}
          </span>
        </div>
        <div className="scroll-x flex gap-2 overflow-x-auto px-5 pb-3">
          {nota.versiculos.map((v) => (
            <VersiculoMargen
              key={v.id}
              referencia={v.referencia}
              variante="chip"
              resaltado={v.id === ultimoDetectado}
              onRemove={() => quitarVersiculo(v.id)}
            />
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              agregarVersiculo();
            }}
            className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-gilt-light pl-3 pr-1"
          >
            <Plus size={13} strokeWidth={2.4} className="text-ink-muted" />
            <label htmlFor="agregar-versiculo-movil" className="sr-only">
              Agregar versículo
            </label>
            <input
              id="agregar-versiculo-movil"
              value={nuevoVersiculo}
              onChange={(e) => setNuevoVersiculo(e.target.value)}
              placeholder="Agregar"
              className="h-8 w-[120px] bg-transparent text-[13px] font-semibold text-ink placeholder:text-ink-muted focus:outline-none"
            />
          </form>
        </div>
        <div className="px-5">{chatInputUI}</div>
      </div>
    </div>
  );
}
