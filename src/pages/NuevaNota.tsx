import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Sparkles, Send, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import VersiculoChip from '../components/VersiculoChip';
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

function scrollIntoViewDelayed(el: HTMLElement) {
  setTimeout(() => {
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, 300);
}

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
  const predicadoresUsados = useRef(getPredicadoresUsados());
  const ignorados = useRef(new Set<string>());

  // Mini-chat IA dentro de la nota
  const [chatAbierto, setChatAbierto] = useState(false);
  const [chatMensajes, setChatMensajes] = useState<MensajeChat[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatCargando, setChatCargando] = useState(false);
  const [chatError, setChatError] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatAbierto) chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMensajes, chatCargando, chatAbierto]);

  async function handleChatEnviar() {
    const pregunta = chatInput.trim();
    if (!pregunta || chatCargando) return;
    const msgUsuario: MensajeChat = { id: generarId(), rol: 'usuario', contenido: pregunta };
    setChatMensajes((prev) => [...prev, msgUsuario]);
    setChatInput('');
    setChatError('');
    setChatCargando(true);
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
    if (!editando) {
      guardarBorrador(nota);
    }
  }, [nota, editando]);

  // Detecta automáticamente referencias bíblicas mientras se escribe en las notas.
  useEffect(() => {
    const detectados = detectarVersiculos(nota.contenido);
    if (detectados.length === 0) return;

    setNota((prev) => {
      const existentes = new Set(prev.versiculos.map((v) => normalizarReferencia(v.referencia)));
      const nuevos = detectados.filter((ref) => {
        const clave = normalizarReferencia(ref);
        return !existentes.has(clave) && !ignorados.current.has(clave);
      });
      if (nuevos.length === 0) return prev;
      const versiculosNuevos: Versiculo[] = nuevos.map((referencia) => ({ id: generarId(), referencia }));
      return { ...prev, versiculos: [...prev.versiculos, ...versiculosNuevos] };
    });
  }, [nota.contenido]);

  function actualizar<K extends keyof Nota>(campo: K, valor: Nota[K]) {
    setNota((prev) => ({ ...prev, [campo]: valor }));
  }

  function agregarVersiculo() {
    const ref = nuevoVersiculo.trim();
    if (!ref) return;
    const v: Versiculo = { id: generarId(), referencia: ref };
    setNota((prev) => ({ ...prev, versiculos: [...prev.versiculos, v] }));
    setNuevoVersiculo('');
  }

  function quitarVersiculo(versId: string) {
    setNota((prev) => {
      const versiculo = prev.versiculos.find((v) => v.id === versId);
      if (versiculo) ignorados.current.add(normalizarReferencia(versiculo.referencia));
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

  return (
    <div className="px-4 pt-4">
      <h2 className="mb-4 text-xl font-semibold text-bark">{editando ? 'Editar nota' : 'Nueva nota'}</h2>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-bark-light" htmlFor="fecha">
            Fecha
          </label>
          <input
            id="fecha"
            type="date"
            value={nota.fecha}
            onChange={(e) => actualizar('fecha', e.target.value)}
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-bark focus:border-sage focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-bark-light" htmlFor="iglesia">
            Iglesia / lugar
          </label>
          <input
            id="iglesia"
            list="sugerencias-iglesia"
            value={nota.iglesia}
            onChange={(e) => actualizar('iglesia', e.target.value)}
            placeholder="Ej. Iglesia Vida Nueva"
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-bark focus:border-sage focus:outline-none"
          />
          <datalist id="sugerencias-iglesia">
            <option value={getUltimaIglesia()} />
          </datalist>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-bark-light" htmlFor="predicador">
            Predicador
          </label>
          <input
            id="predicador"
            list="sugerencias-predicador"
            value={nota.predicador}
            onChange={(e) => actualizar('predicador', e.target.value)}
            placeholder="Ej. Pastor Juan Pérez"
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-bark focus:border-sage focus:outline-none"
          />
          <datalist id="sugerencias-predicador">
            {predicadoresUsados.current.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-bark-light" htmlFor="tema">
            Tema o título del mensaje <span className="text-bark-light/60">(opcional)</span>
          </label>
          <input
            id="tema"
            value={nota.tema}
            onChange={(e) => actualizar('tema', e.target.value)}
            placeholder="Ej. La fe que vence"
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-bark focus:border-sage focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-bark-light" htmlFor="contenido">
            Notas
          </label>
          <textarea
            id="contenido"
            value={nota.contenido}
            onChange={(e) => actualizar('contenido', e.target.value)}
            onFocus={(e) => scrollIntoViewDelayed(e.target)}
            placeholder="Ve anotando libremente lo que el predicador comparte... si escribes un versículo (ej. Juan 3:16) se agregará solo abajo."
            rows={10}
            className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-base leading-relaxed text-bark focus:border-sage focus:outline-none"
          />
        </div>

        {/* Mini-chat IA */}
        <div className="rounded-2xl border border-line bg-surface overflow-hidden">
          <button
            type="button"
            onClick={() => setChatAbierto((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left active:bg-cream-dark/30"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-sage-dark">
              <Sparkles size={15} />
              Consultar con IA
            </span>
            {chatAbierto ? <ChevronUp size={16} className="text-bark-light" /> : <ChevronDown size={16} className="text-bark-light" />}
          </button>

          {chatAbierto && (
            <div className="border-t border-line">
              {chatMensajes.length === 0 && (
                <p className="px-4 py-3 text-xs text-bark-light">
                  Pregúntame sobre un versículo, el tema del sermón o cualquier cosa que no entiendas mientras anotas.
                </p>
              )}

              {chatMensajes.length > 0 && (
                <div className="max-h-56 overflow-y-auto space-y-3 px-4 py-3">
                  {chatMensajes.map((m) => (
                    <div key={m.id} className={`flex ${m.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                        m.rol === 'usuario' ? 'bg-sage text-cream' : 'bg-cream border border-line text-bark'
                      }`}>
                        {m.contenido}
                      </div>
                    </div>
                  ))}
                  {chatCargando && (
                    <div className="flex items-center gap-2 text-xs text-bark-light">
                      <Loader2 size={13} className="animate-spin" />
                      Pensando...
                    </div>
                  )}
                  {chatError && (
                    <p className="text-xs text-red-600">{chatError}</p>
                  )}
                  <div ref={chatBottomRef} />
                </div>
              )}

              <div className="flex gap-2 border-t border-line px-3 py-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleChatEnviar(); } }}
                  placeholder="Ej. ¿Qué significa Juan 3:16?"
                  className="min-w-0 flex-1 rounded-lg border border-line bg-cream px-3 py-2 text-sm text-bark focus:border-sage focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleChatEnviar}
                  disabled={!chatInput.trim() || chatCargando}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage text-cream disabled:opacity-40 active:bg-sage-dark"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-bark-light">Versículos mencionados</label>
          <p className="mb-2 text-xs text-bark-light">
            Se detectan automáticamente al escribirlos en tus notas. También puedes agregar uno manualmente:
          </p>
          <div className="mb-2 flex flex-wrap gap-2">
            {nota.versiculos.map((v) => (
              <VersiculoChip key={v.id} referencia={v.referencia} onRemove={() => quitarVersiculo(v.id)} />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={nuevoVersiculo}
              onChange={(e) => setNuevoVersiculo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  agregarVersiculo();
                }
              }}
              onFocus={(e) => scrollIntoViewDelayed(e.target)}
              placeholder="Ej. Romanos 8:28"
              className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-base text-bark focus:border-sage focus:outline-none"
            />
            <button
              type="button"
              onClick={agregarVersiculo}
              className="flex min-h-[48px] items-center gap-1 rounded-xl bg-sage/10 px-4 text-sm font-medium text-sage-dark active:bg-sage/20"
            >
              <Plus size={18} />
              Agregar
            </button>
          </div>
        </div>
      </div>

      <div style={{ height: 'calc(96px + env(safe-area-inset-bottom))' }} />

      <div
        className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-line bg-cream/95 px-4 pt-3 backdrop-blur"
        style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          disabled={!puedeGuardar}
          onClick={guardar}
          className="w-full rounded-xl bg-sage py-4 text-base font-semibold text-cream shadow-lg shadow-black/20 disabled:opacity-40"
        >
          Guardar nota
        </button>
      </div>
    </div>
  );
}
