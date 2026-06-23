import type { ReferenciaParseada } from './bibleRef';

const TRADUCCION = 'RV1960';

export interface VersoTexto {
  numero: number;
  texto: string;
}

export class BibleError extends Error {}

export async function obtenerTextoCapitulo(ref: ReferenciaParseada): Promise<VersoTexto[]> {
  const url = `https://bolls.life/get-text/${TRADUCCION}/${ref.bookId}/${ref.capitulo}/`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new BibleError('No se pudo conectar para traer el texto del versículo. Revisa tu conexión.');
  }

  if (!response.ok) {
    throw new BibleError('No se pudo cargar el texto del versículo en este momento.');
  }

  const data: { verse: number; text: string }[] = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new BibleError('No se encontró ese capítulo en la Biblia.');
  }

  const inicio = ref.versoInicio ?? data[0].verse;
  const fin = ref.versoFin ?? inicio;

  const versos = data
    .filter((v) => v.verse >= inicio && v.verse <= fin)
    .map((v) => ({ numero: v.verse, texto: v.text.trim() }));

  if (versos.length === 0) {
    throw new BibleError('No se encontraron esos versículos en ese capítulo.');
  }

  return versos;
}
