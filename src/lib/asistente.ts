import { getConfiguracion, getNotas } from './storage';
import type { MensajeChat } from '../types';

export class AsistenteError extends Error {}

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function construirContexto(): string {
  const notas = getNotas().slice(0, 6);
  if (notas.length === 0) return 'El usuario aún no tiene notas guardadas.';
  return notas
    .map((n) => {
      const vers = n.versiculos.map((v) => v.referencia).join(', ');
      const idea = n.resumen?.ideaCentral ? ` — "${n.resumen.ideaCentral}"` : '';
      return `• ${n.fecha}: "${n.tema || 'Sin título'}" por ${n.predicador || '(predicador no especificado)'}${vers ? ` [${vers}]` : ''}${idea}`;
    })
    .join('\n');
}

function sistemaPrompt(): string {
  return `Eres un asistente espiritual cristiano dentro de la app "Daily Bread", una app para tomar notas de sermones. Ayudas al usuario con:

1. Versículos bíblicos: significado, contexto histórico, conexiones con otros pasajes.
2. Preguntas sobre sus propias notas y sermones guardados.
3. Temas espirituales, devocionales o teológicos.
4. Reflexiones personales sobre la fe.

Responde siempre en español, con calidez y claridad. Sé conciso (2-4 párrafos) a menos que el usuario pida más detalle. Usa un tono cercano y edificante, nunca frío ni académico.

Notas recientes del usuario (úsalas para respuestas personalizadas):
${construirContexto()}`;
}

async function porGroq(mensaje: string, historial: MensajeChat[], apiKey: string): Promise<string> {
  const messages = [
    { role: 'system', content: sistemaPrompt() },
    ...historial.map((m) => ({
      role: m.rol === 'usuario' ? 'user' : 'assistant',
      content: m.contenido,
    })),
    { role: 'user', content: mensaje },
  ];

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: GROQ_MODEL, messages }),
  });

  if (!res.ok) {
    if (res.status === 401) throw new AsistenteError('API key de Groq inválida. Revísala en Configuración.');
    if (res.status === 429) throw new AsistenteError('__rate_limit__');
    throw new AsistenteError(`Error de Groq (${res.status}). Intenta de nuevo.`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

async function porGemini(mensaje: string, historial: MensajeChat[], apiKey: string): Promise<string> {
  const contents = [
    ...historial.map((m) => ({
      role: m.rol === 'usuario' ? 'user' : 'model',
      parts: [{ text: m.contenido }],
    })),
    { role: 'user', parts: [{ text: mensaje }] },
  ];

  const res = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: sistemaPrompt() }] },
      contents,
    }),
  });

  if (!res.ok) {
    if (res.status === 400 || res.status === 403)
      throw new AsistenteError('API key de Gemini inválida. Revísala en Configuración.');
    if (res.status === 429) throw new AsistenteError('Límite de Gemini alcanzado. Intenta más tarde.');
    throw new AsistenteError(`Error de Gemini (${res.status}). Intenta de nuevo.`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export async function enviarMensaje(mensaje: string, historial: MensajeChat[]): Promise<string> {
  const { apiKey, geminiApiKey } = getConfiguracion();

  if (!apiKey && !geminiApiKey) {
    throw new AsistenteError(
      'No tienes una API key configurada. Ve a Configuración y agrega tu clave de Groq o Gemini.',
    );
  }

  if (apiKey) {
    try {
      const respuesta = await porGroq(mensaje, historial, apiKey);
      if (respuesta) return respuesta;
    } catch (e) {
      const esRateLimit = e instanceof AsistenteError && e.message === '__rate_limit__';
      if (!esRateLimit || !geminiApiKey) throw e;
    }
  }

  if (geminiApiKey) {
    return await porGemini(mensaje, historial, geminiApiKey);
  }

  throw new AsistenteError('No se pudo obtener respuesta. Intenta de nuevo.');
}
