import { useEffect, useState } from 'react';
import { parseReferencia } from './bibleRef';
import { obtenerTextoCapitulo } from './bible';

const cacheTextos = new Map<string, Promise<string>>();

/** Texto (Reina-Valera 1960) de una referencia; se pide una sola vez por referencia. */
export function textoDe(referencia: string): Promise<string> {
  const clave = referencia.trim().toLowerCase();
  let promesa = cacheTextos.get(clave);
  if (!promesa) {
    const parsed = parseReferencia(referencia);
    promesa = parsed
      ? obtenerTextoCapitulo(parsed).then((versos) => versos.map((v) => v.texto).join(' '))
      : Promise.resolve('');
    cacheTextos.set(clave, promesa);
  }
  return promesa;
}

/** Devuelve null mientras carga y '' si no se pudo obtener el texto. */
export function useTextoVersiculo(referencia: string | undefined): string | null {
  const [resultado, setResultado] = useState<{ referencia: string; texto: string } | null>(null);

  useEffect(() => {
    if (!referencia) return;
    let activo = true;
    textoDe(referencia)
      .then((t) => activo && setResultado({ referencia, texto: t }))
      .catch(() => activo && setResultado({ referencia, texto: '' }));
    return () => {
      activo = false;
    };
  }, [referencia]);

  if (!referencia) return '';
  return resultado?.referencia === referencia ? resultado.texto : null;
}
