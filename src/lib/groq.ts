import type { EstiloResumen, Nota, Resumen } from '../types';

const MODEL = 'llama-3.3-70b-versatile';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export class GroqError extends Error {}

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
    throw new GroqError('No has configurado tu API key de Groq. Ve a Configuración para agregarla.');
  }

  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: construirPrompt(nota, estilo) }],
        response_format: { type: 'json_object' },
      }),
    });
  } catch {
    throw new GroqError('No se pudo conectar con la API de Groq. Revisa tu conexión a internet.');
  }

  if (!response.ok) {
    let detalle = '';
    try {
      const cuerpo = await response.json();
      detalle = cuerpo?.error?.message ?? '';
    } catch {
      // sin cuerpo JSON, seguimos con el mensaje genérico
    }

    if (response.status === 401) {
      throw new GroqError('Tu API key parece ser inválida. Revísala en Configuración.');
    }
    if (response.status === 429) {
      throw new GroqError(
        `Se alcanzó el límite de uso gratuito de la API.${detalle ? ` (${detalle})` : ''} Espera un momento e intenta de nuevo.`,
      );
    }
    throw new GroqError(
      `Error al generar el resumen (código ${response.status}).${detalle ? ` ${detalle}` : ''} Intenta de nuevo.`,
    );
  }

  const data = await response.json();
  const textoRespuesta: string | undefined = data?.choices?.[0]?.message?.content;
  if (!textoRespuesta) {
    throw new GroqError('La respuesta de la IA no tuvo el formato esperado.');
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
    throw new GroqError('No se pudo interpretar la respuesta de la IA. Intenta de nuevo.');
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
