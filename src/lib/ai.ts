import { GroqError, generarResumen as generarConGroq } from './groq';
import { GeminiError, generarResumen as generarConGemini } from './gemini';
import { getConfiguracion } from './storage';
import type { EstiloResumen, Nota, Resumen } from '../types';

export class AIError extends Error {}

function esLimiteDeUso(e: unknown): boolean {
  return e instanceof GroqError && /límite|429/i.test(e.message);
}

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ESPERAS_REINTENTO_MS = [0, 1500, 3500];

export async function generarResumenIA(nota: Nota, estilo: EstiloResumen): Promise<Resumen> {
  const { apiKey: groqKey, geminiApiKey } = getConfiguracion();

  let ultimoError: unknown;

  for (const espera of ESPERAS_REINTENTO_MS) {
    if (espera > 0) await esperar(espera);
    try {
      return await generarConGroq(nota, estilo, groqKey);
    } catch (e) {
      ultimoError = e;
      if (!esLimiteDeUso(e)) break; // error no recuperable (key inválida, etc.): no reintentar
    }
  }

  if (geminiApiKey) {
    try {
      return await generarConGemini(nota, estilo, geminiApiKey);
    } catch (e) {
      ultimoError = e;
    }
  }

  if (ultimoError instanceof GroqError || ultimoError instanceof GeminiError) {
    throw new AIError(ultimoError.message);
  }
  throw new AIError('No se pudo generar el resumen. Intenta de nuevo más tarde.');
}
