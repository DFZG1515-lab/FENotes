import type { Nota } from '../types';

export function tituloNota(nota: Nota): string {
  return nota.tema || nota.versiculos[0]?.referencia || 'Nota sin título';
}

/** Una frase para mostrar bajo el título en las listas: la idea central o la primera oración de lo anotado. */
export function extractoNota(nota: Nota): string {
  const fuente = nota.resumen?.ideaCentral || nota.contenido;
  const linea = fuente.replace(/\s+/g, ' ').trim();
  return linea.split(/(?<=[.!?])\s/)[0];
}

/** "Dom 1" */
export function fechaMuyCorta(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00');
  const dia = d.toLocaleDateString('es', { weekday: 'short' }).replace('.', '');
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${d.getDate()}`;
}
