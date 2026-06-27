import {
  getConfiguracion,
  getNotas,
  getPredicadoresUsados,
  getUltimaIglesia,
  restaurarNotasDesdeBackup,
  saveConfiguracion,
} from './storage';
import type { Nota } from '../types';

const ARCHIVO_WIDGET = 'daily-bread-latest.json';
const ARCHIVO_BACKUP = 'daily-bread-backup.json';
const DESCRIPCION = 'Daily Bread - widget y respaldo de notas';

function construirMensaje(nota: Nota): string {
  if (nota.resumen) {
    return nota.resumen.ideaCentral || nota.resumen.aplicacion || '';
  }
  return nota.contenido.slice(0, 220);
}

function construirPayloadWidget(nota: Nota) {
  return {
    fecha: nota.fecha,
    iglesia: nota.iglesia,
    predicador: nota.predicador,
    tema: nota.tema,
    mensaje: construirMensaje(nota),
    tieneResumen: Boolean(nota.resumen),
    versiculos: nota.versiculos.map((v) => v.referencia).slice(0, 5),
    actualizadoEn: nota.actualizadoEn,
  };
}

/** Respaldo completo de notas, sin incluir API keys ni tokens. */
function construirPayloadBackup() {
  return {
    notas: getNotas(),
    ultimaIglesia: getUltimaIglesia(),
    predicadoresUsados: getPredicadoresUsados(),
    respaldadoEn: new Date().toISOString(),
  };
}

export class WidgetSyncError extends Error {}

interface ResultadoGist {
  gistId: string;
  owner: string;
}

async function publicarGist(
  token: string,
  gistId: string | undefined,
  files: Record<string, { content: string }>,
): Promise<ResultadoGist> {
  const url = gistId ? `https://api.github.com/gists/${gistId}` : 'https://api.github.com/gists';
  const method = gistId ? 'PATCH' : 'POST';

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ description: DESCRIPCION, public: false, files }),
  });

  if (!response.ok) {
    throw new WidgetSyncError(`No se pudo sincronizar (código ${response.status}). Revisa tu token de GitHub.`);
  }

  const data = await response.json();
  return { gistId: data.id, owner: data.owner.login };
}

function rawUrl(owner: string, gistId: string, archivo: string): string {
  return `https://gist.githubusercontent.com/${owner}/${gistId}/raw/${archivo}`;
}

/** Sincroniza el widget (última nota) y el respaldo completo de notas en un mismo Gist privado. */
export async function sincronizarWidget(nota: Nota): Promise<string | null> {
  const config = getConfiguracion();
  if (!config.githubToken) return null;

  const { gistId, owner } = await publicarGist(config.githubToken, config.gistId, {
    [ARCHIVO_WIDGET]: { content: JSON.stringify(construirPayloadWidget(nota), null, 2) },
    [ARCHIVO_BACKUP]: { content: JSON.stringify(construirPayloadBackup(), null, 2) },
  });

  if (gistId !== config.gistId || owner !== config.githubUsername) {
    saveConfiguracion({ ...config, gistId, githubUsername: owner });
  }
  return rawUrl(owner, gistId, ARCHIVO_WIDGET);
}

/** Sincroniza sin lanzar errores a la UI; se usa como efecto secundario al guardar notas.
 * Siempre muestra en el widget la nota de fecha más reciente, no la que se acaba de guardar. */
export function sincronizarWidgetSilencioso(): void {
  const masReciente = getNotas()[0];
  if (!masReciente) return;
  sincronizarWidget(masReciente).catch((err) => {
    console.warn('No se pudo sincronizar el widget de Scriptable:', err);
  });
}

export async function restaurarBackupDesdeGitHub(): Promise<number> {
  const config = getConfiguracion();
  if (!config.githubUsername || !config.gistId) {
    throw new WidgetSyncError('Primero sincroniza el widget al menos una vez desde este u otro dispositivo.');
  }

  const url = rawUrl(config.githubUsername, config.gistId, ARCHIVO_BACKUP) + `?t=${Date.now()}`;
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new WidgetSyncError('No se pudo conectar a GitHub. Revisa tu conexión.');
  }

  if (!response.ok) {
    throw new WidgetSyncError('No se encontró ningún respaldo en tu Gist de GitHub.');
  }

  const backup = await response.json();
  if (!Array.isArray(backup?.notas)) {
    throw new WidgetSyncError('El respaldo encontrado no tiene un formato válido.');
  }

  restaurarNotasDesdeBackup(backup);
  return backup.notas.length;
}
