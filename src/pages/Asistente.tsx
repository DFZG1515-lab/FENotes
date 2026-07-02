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

function BurbujaMensaje({ mensaje }: { mensaje: MensajeChat }) {
  const esUsuario = mensaje.rol === 'usuario';
  return (
    <div className={`flex ${esUsuario ? 'justify-end' : 'justify-start'}`}>
      {!esUsuario && (
        <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage text-cream">
          <Sparkles size={14} />
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          esUsuario
            ? 'rounded-br-sm bg-sage text-cream'
            : 'rounded-bl-sm bg-surface text-bark border border-line'
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
      <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage text-cream">
        <Sparkles size={14} />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-line bg-surface px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-bark-light"
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
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 120px)' }}>
      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {sinMensajes ? (
          <div className="flex flex-col items-center pt-6 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sage/10 text-sage">
              <Sparkles size={26} />
            </div>
            <p className="text-base font-semibold text-bark">Asistente espiritual</p>
            <p className="mt-1 max-w-[260px] text-sm text-bark-light">
              Pregúntame sobre versículos, tus sermones guardados o cualquier tema de fe.
            </p>

            <div className="mt-6 flex w-full flex-col gap-2">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleEnviar(s)}
                  className="rounded-xl border border-line bg-surface px-4 py-3 text-left text-sm text-bark-light active:bg-cream-dark/40"
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
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input fijo abajo */}
      <div
        className="border-t border-line bg-cream/95 px-4 pt-3 backdrop-blur"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleEnviar();
              }
            }}
            placeholder="Escribe tu pregunta..."
            className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-base text-bark focus:border-sage focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleEnviar()}
            disabled={!input.trim() || cargando}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage text-cream disabled:opacity-40 active:bg-sage-dark"
          >
            {cargando ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
