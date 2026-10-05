import { useEffect, useState } from 'react';
import { obtenerTextoCapitulo } from './bible';

interface VersiculoCurado {
  ref: string;
  bookId: number;
  capitulo: number;
  versoInicio: number;
  versoFin: number;
}

const VERSICULOS: VersiculoCurado[] = [
  { ref: 'Juan 3:16', bookId: 43, capitulo: 3, versoInicio: 16, versoFin: 16 },
  { ref: 'Salmos 23:1-3', bookId: 19, capitulo: 23, versoInicio: 1, versoFin: 3 },
  { ref: 'Proverbios 3:5-6', bookId: 20, capitulo: 3, versoInicio: 5, versoFin: 6 },
  { ref: 'Filipenses 4:13', bookId: 50, capitulo: 4, versoInicio: 13, versoFin: 13 },
  { ref: 'Romanos 8:28', bookId: 45, capitulo: 8, versoInicio: 28, versoFin: 28 },
  { ref: 'Isaías 40:31', bookId: 23, capitulo: 40, versoInicio: 31, versoFin: 31 },
  { ref: 'Jeremías 29:11', bookId: 24, capitulo: 29, versoInicio: 11, versoFin: 11 },
  { ref: 'Josué 1:9', bookId: 6, capitulo: 1, versoInicio: 9, versoFin: 9 },
  { ref: 'Mateo 11:28', bookId: 40, capitulo: 11, versoInicio: 28, versoFin: 28 },
  { ref: 'Salmos 46:1', bookId: 19, capitulo: 46, versoInicio: 1, versoFin: 1 },
  { ref: 'Romanos 8:38-39', bookId: 45, capitulo: 8, versoInicio: 38, versoFin: 39 },
  { ref: 'Filipenses 4:6-7', bookId: 50, capitulo: 4, versoInicio: 6, versoFin: 7 },
  { ref: 'Mateo 6:33', bookId: 40, capitulo: 6, versoInicio: 33, versoFin: 33 },
  { ref: 'Salmos 119:105', bookId: 19, capitulo: 119, versoInicio: 105, versoFin: 105 },
  { ref: 'Isaías 41:10', bookId: 23, capitulo: 41, versoInicio: 10, versoFin: 10 },
  { ref: 'Juan 14:6', bookId: 43, capitulo: 14, versoInicio: 6, versoFin: 6 },
  { ref: 'Efesios 2:8-9', bookId: 49, capitulo: 2, versoInicio: 8, versoFin: 9 },
  { ref: '2 Timoteo 3:16-17', bookId: 55, capitulo: 3, versoInicio: 16, versoFin: 17 },
  { ref: 'Gálatas 5:22-23', bookId: 48, capitulo: 5, versoInicio: 22, versoFin: 23 },
  { ref: 'Salmos 27:1', bookId: 19, capitulo: 27, versoInicio: 1, versoFin: 1 },
  { ref: 'Mateo 5:3-5', bookId: 40, capitulo: 5, versoInicio: 3, versoFin: 5 },
  { ref: 'Juan 1:1-3', bookId: 43, capitulo: 1, versoInicio: 1, versoFin: 3 },
  { ref: 'Hebreos 11:1', bookId: 58, capitulo: 11, versoInicio: 1, versoFin: 1 },
  { ref: '1 Corintios 13:4-5', bookId: 46, capitulo: 13, versoInicio: 4, versoFin: 5 },
  { ref: 'Santiago 1:2-3', bookId: 59, capitulo: 1, versoInicio: 2, versoFin: 3 },
  { ref: 'Romanos 12:1-2', bookId: 45, capitulo: 12, versoInicio: 1, versoFin: 2 },
  { ref: 'Salmos 37:4', bookId: 19, capitulo: 37, versoInicio: 4, versoFin: 4 },
  { ref: 'Colosenses 3:23', bookId: 51, capitulo: 3, versoInicio: 23, versoFin: 23 },
  { ref: '1 Juan 4:19', bookId: 62, capitulo: 4, versoInicio: 19, versoFin: 19 },
  { ref: 'Efesios 6:10-11', bookId: 49, capitulo: 6, versoInicio: 10, versoFin: 11 },
  { ref: 'Mateo 28:19-20', bookId: 40, capitulo: 28, versoInicio: 19, versoFin: 20 },
  { ref: 'Salmos 1:1-2', bookId: 19, capitulo: 1, versoInicio: 1, versoFin: 2 },
  { ref: 'Juan 10:10', bookId: 43, capitulo: 10, versoInicio: 10, versoFin: 10 },
  { ref: 'Proverbios 22:6', bookId: 20, capitulo: 22, versoInicio: 6, versoFin: 6 },
  { ref: 'Salmos 34:18', bookId: 19, capitulo: 34, versoInicio: 18, versoFin: 18 },
  { ref: '2 Corintios 5:17', bookId: 47, capitulo: 5, versoInicio: 17, versoFin: 17 },
  { ref: 'Romanos 5:8', bookId: 45, capitulo: 5, versoInicio: 8, versoFin: 8 },
  { ref: 'Juan 15:5', bookId: 43, capitulo: 15, versoInicio: 5, versoFin: 5 },
  { ref: 'Hebreos 12:1-2', bookId: 58, capitulo: 12, versoInicio: 1, versoFin: 2 },
  { ref: 'Apocalipsis 3:20', bookId: 66, capitulo: 3, versoInicio: 20, versoFin: 20 },
];

function diaDelAno(): number {
  const now = new Date();
  const inicio = new Date(now.getFullYear(), 0, 1);
  return Math.floor((now.getTime() - inicio.getTime()) / 86400000);
}

export function fechaDeHoy(): string {
  const texto = new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function saludo(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export type EstadoPan = 'cargando' | 'listo' | 'error';

/** Versículo del día ("Pan de hoy"): cambia cada día y se carga en Reina-Valera 1960. */
export function usePanDeHoy() {
  const versiculo = VERSICULOS[diaDelAno() % VERSICULOS.length];
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState<EstadoPan>('cargando');
  const [intento, setIntento] = useState(0);

  function reintentar() {
    setEstado('cargando');
    setIntento((n) => n + 1);
  }

  useEffect(() => {
    let activo = true;
    obtenerTextoCapitulo({
      libro: '',
      bookId: versiculo.bookId,
      capitulo: versiculo.capitulo,
      versoInicio: versiculo.versoInicio,
      versoFin: versiculo.versoFin,
    })
      .then((versos) => {
        if (!activo) return;
        setTexto(versos.map((v) => v.texto).join(' '));
        setEstado('listo');
      })
      .catch(() => activo && setEstado('error'));
    return () => {
      activo = false;
    };
  }, [intento, versiculo]);

  return { referencia: versiculo.ref, texto, estado, reintentar };
}
