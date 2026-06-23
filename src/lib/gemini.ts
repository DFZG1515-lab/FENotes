import type { EstiloResumen, Nota, Resumen } from '../types';

const MODEL = 'gemini-2.0-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export class GeminiError extends Error {}

function construirPrompt(nota: Nota, estilo: EstiloResumen): string {
  const versiculosUsuario = nota.versiculos.map((v) => v.referencia).join(', ') || '(ninguno marcado)';

  const detalle =
    estilo === 'estudio'
      ? 'Hazlo en estilo de ESTUDIO BÍBLICO: detallado, con análisis del contexto y conexiones entre los puntos. Usa entre 4 y 6 puntos principales.'
      : 'Hazlo en estilo DEVOCIONAL CORTO: breve, cálido y fácil de leer en un momento de quietud personal. Usa entre 3 y 4 puntos principales.';

  return `Eres un asistente que ayuda a resumir notas tomadas a mano durante un servicio o culto cristiano.

Metadata del mensaje:
- Predicador: ${nota.predicador || '(no especificado)'}
- Tema/título: ${nota.tema || '(no especificado)'}
- Versículos marcados por el usuario: ${versiculosUsuario}

Notas crudas tomadas durante el servicio:
"""
${nota.contenido}
"""

${detalle}

Responde con un objeto JSON con esta forma exacta:
{
  "ideaCentral": "1-2 frases en español con la idea central del mensaje",
  "puntosPrincipales": ["punto 1", "punto 2", "..."],
  "versiculosClave": ["referencia 1", "referencia 2", "..."],
  "aplicacion": "un párrafo corto en español con una aplicación práctica o reflexión final"
}

Para "versiculosClave" incluye los versículos marcados por el usuario más cualquier otro que detectes mencionado en el texto de las notas, sin duplicar.`;
}

export async function generarResumen(
  nota: Nota,
  estilo: EstiloResumen,
  apiKey: string,
): Promise<Resumen> {
  if (!apiKey) {
    throw new GeminiError('No has configurado tu API key de Google Gemini.');
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: construirPrompt(nota, estilo) }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });
  } catch {
    throw new GeminiError('No se pudo conectar con la API de Gemini. Revisa tu conexión a internet.');
  }

  if (!response.ok) {
    let detalle = '';
    try {
      const cuerpo = await response.json();
      detalle = cuerpo?.error?.message ?? '';
    } catch {
      // sin cuerpo JSON, seguimos con el mensaje genérico
    }

    if (response.status === 400 || response.status === 403) {
      throw new GeminiError('Tu API key de Gemini parece ser inválida.');
    }
    if (response.status === 429) {
      throw new GeminiError(`Límite de uso de Gemini alcanzado.${detalle ? ` (${detalle})` : ''}`);
    }
    throw new GeminiError(`Error de Gemini (código ${response.status}).${detalle ? ` ${detalle}` : ''}`);
  }

  const data = await response.json();
  const textoRespuesta: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textoRespuesta) {
    throw new GeminiError('La respuesta de Gemini no tuvo el formato esperado.');
  }

  let parsed: {
    ideaCentral?: string;
    puntosPrincipales?: string[];
    versiculosClave?: string[];
    aplicacion?: string;
  };
  try {
    parsed = JSON.parse(textoRespuesta);
  } catch {
    throw new GeminiError('No se pudo interpretar la respuesta de Gemini.');
  }

  return {
    estilo,
    ideaCentral: parsed.ideaCentral ?? '',
    puntosPrincipales: parsed.puntosPrincipales ?? [],
    versiculosClave: parsed.versiculosClave ?? [],
    aplicacion: parsed.aplicacion ?? '',
    generadoEn: new Date().toISOString(),
  };
}
