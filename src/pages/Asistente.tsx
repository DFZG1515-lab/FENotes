import { useEffect, useRef, useState } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { AsistenteError, enviarMensaje } from '../lib/asistente';
import { generarId } from '../lib/id';
import type { MensajeChat } from '../types';

const SUGERENCIAS = [
  '¿Qué dice Juan 3:16?',
  '¿Cuál fue el tema de mi último sermón?',
  '¿Qué significa "gracia" en la Biblia?',
  'Dame una reflexión devocional para hoy',
  '¿Qué versículos hablan de la fe?',
];

function Avatar() {
  return (
    <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-page text-gilt">
      <Sparkles size={13} strokeWidth={2.2} />
    </div>
  );
}

function BurbujaMensaje({ mensaje }: { mensaje: MensajeChat }) {
  const esUsuario = mensaje.rol === 'usuario';
  return (
    <div className={`flex ${esUsuario ? 'justify-end' : 'justify-start'}`}>
      {!esUsuario && <Avatar />}
      <div
        className={`max-w-[82%] px-4 py-3 text-[15px] leading-relaxed lg:text-sm ${
          esUsuario
            ? 'rounded-[16px_16px_4px_16px] bg-ribbon text-white'
            : 'rounded-[16px_16px_16px_4px] border border-line bg-page text-ink'
        }`}
      >
        {mensaje.contenido}
      </div>
    </div>
  );
}

function IndicadorEscribiendo() {
  return (
    <div className="flex justify-start">
      <Avatar />
      <div className="flex items-center gap-1.5 rounded-[16px_16px_16px_4px] border border-line bg-page px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-ink-muted"
            style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Asistente() {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, cargando]);

  async function handleEnviar(texto?: string) {
    const pregunta = (texto ?? input).trim();
    if (!pregunta || cargando) return;

    const msgUsuario: MensajeChat = { id: generarId(), rol: 'usuario', contenido: pregunta };
    setMensajes((prev) => [...prev, msgUsuario]);
    setInput('');
    setError('');
    setCargando(true);

    try {
      const respuesta = await enviarMensaje(pregunta, mensajes);
      const msgAsistente: MensajeChat = { id: generarId(), rol: 'asistente', contenido: respuesta };
      setMensajes((prev) => [...prev, msgAsistente]);
    } catch (e) {
      setError(e instanceof AsistenteError ? e.message : 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  const sinMensajes = mensajes.length === 0;

  return (
    <div className="flex h-[calc(100dvh-140px)] flex-col lg:h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[760px] px-5 pt-4 lg:px-10 lg:pt-8">
          {sinMensajes ? (
            <div className="flex flex-col items-center pt-6 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-page text-gilt">
                <Sparkles size={24} />
              </div>
              <p className="font-serif text-2xl font-medium text-ink">Asistente</p>
              <p className="mt-1 max-w-[300px] text-sm leading-relaxed text-ink-muted">
                Pregunta sobre versículos, tus sermones guardados o cualquier tema de fe.
              </p>

              <div className="mt-6 flex w-full flex-col gap-2 lg:grid lg:grid-cols-2">
                {SUGERENCIAS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleEnviar(s)}
                    className="rounded-xl border border-line bg-page px-4 py-3 text-left text-sm text-ink-soft transition-colors hover:bg-paper active:bg-cream-dark/40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {mensajes.map((m) => (
                <BurbujaMensaje key={m.id} mensaje={m} />
              ))}
              {cargando && <IndicadorEscribiendo />}
              {error && <div className="rounded-xl bg-[#f6e3e3] px-4 py-3 text-sm text-[#7f2e2e]">{error}</div>}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      <div
        className="border-t border-line bg-paper/95 backdrop-blur"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex w-full max-w-[760px] gap-2 px-5 pt-3 lg:px-10">
          <label htmlFor="pregunta-asistente" className="sr-only">
            Escribe tu pregunta
          </label>
          <input
            id="pregunta-asistente"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleEnviar();
              }
            }}
            placeholder="Escribe tu pregunta"
            className="h-12 min-w-0 flex-1 rounded-xl border border-line bg-page px-4 text-base text-ink placeholder:text-ink-muted/70 focus:border-gilt-light focus:outline-none lg:text-sm"
          />
          <button
            type="button"
            onClick={() => handleEnviar()}
            disabled={!input.trim() || cargando}
            aria-label="Enviar"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink text-page disabled:opacity-40"
          >
            {cargando ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
