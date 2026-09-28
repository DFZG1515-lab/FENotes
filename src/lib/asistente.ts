import { getConfiguracion } from './storage';
import type { MensajeChat } from '../types';

export class AsistenteError extends Error {}

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function promptEnNota(ctx: { predicador?: string; tema?: string; contenido?: string; versiculos?: string[] }): string {
  const vers = ctx.versiculos?.filter(Boolean).join(', ');
  return `Eres un asistente espiritual cristiano dentro de la app "Daily Bread". El usuario está tomando notas de un sermón ahora mismo y tiene preguntas mientras escucha.

Contexto del sermón actual:
- Predicador: ${ctx.predicador || '(no especificado)'}
- Tema: ${ctx.tema || '(no especificado)'}
${vers ? `- Versículos mencionados: ${vers}` : ''}
${ctx.contenido ? `- Notas escritas hasta ahora:\n"""\n${ctx.contenido.slice(0, 600)}\n"""` : ''}

Ayuda al usuario a entender mejor el sermón: explica versículos, amplía conceptos, da contexto bíblico. Responde en español, de forma concisa (1-3 párrafos), cálida y útil para alguien que está escuchando en este momento.`;
}

async function llamarIA(
  prompt: string,
  messages: { role: string; content: string }[],
): Promise<string> {
  const { apiKey, geminiApiKey } = getConfiguracion();

  if (!apiKey && !geminiApiKey) {
    throw new AsistenteError(
      'No tienes una API key configurada. Ve a Configuración para agregar tu clave de Groq o Gemini.',
    );
  }

  if (apiKey) {
    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: 'system', content: prompt }, ...messages],
        }),
      });
      if (!res.ok) {
        if (res.status === 401) throw new AsistenteError('API key de Groq inválida. Revísala en Configuración.');
        if (res.status === 429) throw new AsistenteError('__rate_limit__');
        throw new AsistenteError(`Error de Groq (${res.status}). Intenta de nuevo.`);
      }
      const data = await res.json();
      const texto: string = data?.choices?.[0]?.message?.content ?? '';
      if (texto) return texto;
    } catch (e) {
      const esRateLimit = e instanceof AsistenteError && e.message === '__rate_limit__';
      if (!esRateLimit || !geminiApiKey) throw e;
    }
  }

  if (geminiApiKey) {
    const contents = messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));
    const res = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(geminiApiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: prompt }] },
        contents,
      }),
    });
    if (!res.ok) throw new AsistenteError(`Error de Gemini (${res.status}). Intenta de nuevo.`);
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }

  throw new AsistenteError('No se pudo obtener respuesta. Intenta de nuevo.');
}

function toMessages(historial: MensajeChat[], mensaje: string) {
  return [
    ...historial.map((m) => ({ role: m.rol === 'usuario' ? 'user' : 'assistant', content: m.contenido })),
    { role: 'user', content: mensaje },
  ];
}

/** Chat contextualizado al sermón que el usuario está anotando ahora mismo. */
export async function enviarMensajeEnNota(
  mensaje: string,
  historial: MensajeChat[],
  ctx: { predicador?: string; tema?: string; contenido?: string; versiculos?: string[] },
): Promise<string> {
  return llamarIA(promptEnNota(ctx), toMessages(historial, mensaje));
}
