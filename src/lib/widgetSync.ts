import { getConfiguracion, saveConfiguracion } from './storage';
import type { Nota } from '../types';

const NOMBRE_ARCHIVO = 'daily-bread-latest.json';
const DESCRIPCION = 'Daily Bread - última nota (para widget de Scriptable)';

function construirMensaje(nota: Nota): string {
  if (nota.resumen) {
    return nota.resumen.ideaCentral || nota.resumen.aplicacion || '';
  }
  return nota.contenido.slice(0, 220);
}

function construirPayload(nota: Nota) {
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

export class WidgetSyncError extends Error {}

async function publicarGist(
  token: string,
  gistId: string | undefined,
  contenido: string,
): Promise<{ gistId: string; rawUrl: string }> {
  const url = gistId ? `https://api.github.com/gists/${gistId}` : 'https://api.github.com/gists';
  const method = gistId ? 'PATCH' : 'POST';

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: DESCRIPCION,
      public: false,
      files: { [NOMBRE_ARCHIVO]: { content: contenido } },
    }),
  });

  if (!response.ok) {
    throw new WidgetSyncError(`No se pudo sincronizar el widget (código ${response.status}).`);
  }

  const data = await response.json();
  const rawUrl = `https://gist.githubusercontent.com/${data.owner.login}/${data.id}/raw/${NOMBRE_ARCHIVO}`;
  return { gistId: data.id, rawUrl };
}

export async function sincronizarWidget(nota: Nota): Promise<string | null> {
  const config = getConfiguracion();
  if (!config.githubToken) return null;

  const contenido = JSON.stringify(construirPayload(nota), null, 2);
  const { gistId, rawUrl } = await publicarGist(config.githubToken, config.gistId, contenido);

  if (gistId !== config.gistId) {
    saveConfiguracion({ ...config, gistId });
  }
  return rawUrl;
}

/** Sincroniza sin lanzar errores a la UI; se usa como efecto secundario al guardar notas. */
export function sincronizarWidgetSilencioso(nota: Nota): void {
  sincronizarWidget(nota).catch((err) => {
    console.warn('No se pudo sincronizar el widget de Scriptable:', err);
  });
}
