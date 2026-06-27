import type { Configuracion, FeNotesData, Nota } from '../types';

const STORAGE_KEY = 'fenotes-data-v1';

function defaultData(): FeNotesData {
  return {
    notas: [],
    configuracion: { apiKey: '' },
    ultimaIglesia: '',
    predicadoresUsados: [],
  };
}

function readData(): FeNotesData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultData();
  try {
    const parsed = JSON.parse(raw);
    return {
      ...defaultData(),
      ...parsed,
    };
  } catch {
    return defaultData();
  }
}

function writeData(data: FeNotesData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getNotas(): Nota[] {
  return readData().notas.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
    return a.creadoEn < b.creadoEn ? 1 : -1;
  });
}

export function getNota(id: string): Nota | undefined {
  return readData().notas.find((n) => n.id === id);
}

export function saveNota(nota: Nota): void {
  const data = readData();
  const idx = data.notas.findIndex((n) => n.id === nota.id);
  if (idx >= 0) {
    data.notas[idx] = nota;
  } else {
    data.notas.push(nota);
  }
  data.ultimaIglesia = nota.iglesia || data.ultimaIglesia;
  if (nota.predicador && !data.predicadoresUsados.includes(nota.predicador)) {
    data.predicadoresUsados.push(nota.predicador);
  }
  writeData(data);
}

export function deleteNota(id: string): void {
  const data = readData();
  data.notas = data.notas.filter((n) => n.id !== id);
  writeData(data);
}

export function getUltimaIglesia(): string {
  return readData().ultimaIglesia;
}

export function getPredicadoresUsados(): string[] {
  return readData().predicadoresUsados;
}

export function getConfiguracion(): Configuracion {
  return readData().configuracion;
}

export function saveConfiguracion(configuracion: Configuracion): void {
  const data = readData();
  data.configuracion = configuracion;
  writeData(data);
}

export function getTotalNotas(): number {
  return readData().notas.length;
}

export function exportarJSON(): string {
  return JSON.stringify(readData(), null, 2);
}

export function restaurarNotasDesdeBackup(backup: {
  notas: Nota[];
  ultimaIglesia?: string;
  predicadoresUsados?: string[];
}): void {
  const data = readData();
  data.notas = backup.notas;
  if (backup.ultimaIglesia) data.ultimaIglesia = backup.ultimaIglesia;
  if (backup.predicadoresUsados) data.predicadoresUsados = backup.predicadoresUsados;
  writeData(data);
}

export function importarJSON(json: string): void {
  const parsed = JSON.parse(json) as FeNotesData;
  if (!Array.isArray(parsed.notas)) {
    throw new Error('Archivo inválido: no contiene notas.');
  }
  writeData({
    ...defaultData(),
    ...parsed,
  });
}

const DRAFT_KEY = 'fenotes-draft-v1';

export function getBorrador(): Partial<Nota> | null {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function guardarBorrador(nota: Partial<Nota>): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(nota));
}

export function limpiarBorrador(): void {
  localStorage.removeItem(DRAFT_KEY);
}
