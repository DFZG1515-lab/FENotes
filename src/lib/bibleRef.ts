export interface ReferenciaParseada {
  libro: string;
  bookId: number;
  capitulo: number;
  versoInicio?: number;
  versoFin?: number;
}

// Numeración estándar de los 66 libros (Génesis=1 ... Apocalipsis=66), usada por la API bolls.life.
const LIBROS: { id: number; nombre: string; alias?: string[] }[] = [
  { id: 1, nombre: 'Génesis' },
  { id: 2, nombre: 'Éxodo', alias: ['Exodo'] },
  { id: 3, nombre: 'Levítico' },
  { id: 4, nombre: 'Números' },
  { id: 5, nombre: 'Deuteronomio' },
  { id: 6, nombre: 'Josué' },
  { id: 7, nombre: 'Jueces' },
  { id: 8, nombre: 'Rut' },
  { id: 9, nombre: '1 Samuel' },
  { id: 10, nombre: '2 Samuel' },
  { id: 11, nombre: '1 Reyes' },
  { id: 12, nombre: '2 Reyes' },
  { id: 13, nombre: '1 Crónicas' },
  { id: 14, nombre: '2 Crónicas' },
  { id: 15, nombre: 'Esdras' },
  { id: 16, nombre: 'Nehemías' },
  { id: 17, nombre: 'Ester' },
  { id: 18, nombre: 'Job' },
  { id: 19, nombre: 'Salmos', alias: ['Salmo'] },
  { id: 20, nombre: 'Proverbios' },
  { id: 21, nombre: 'Eclesiastés' },
  { id: 22, nombre: 'Cantares' },
  { id: 23, nombre: 'Isaías' },
  { id: 24, nombre: 'Jeremías' },
  { id: 25, nombre: 'Lamentaciones' },
  { id: 26, nombre: 'Ezequiel' },
  { id: 27, nombre: 'Daniel' },
  { id: 28, nombre: 'Oseas' },
  { id: 29, nombre: 'Joel' },
  { id: 30, nombre: 'Amós' },
  { id: 31, nombre: 'Abdías' },
  { id: 32, nombre: 'Jonás' },
  { id: 33, nombre: 'Miqueas' },
  { id: 34, nombre: 'Nahúm' },
  { id: 35, nombre: 'Habacuc' },
  { id: 36, nombre: 'Sofonías' },
  { id: 37, nombre: 'Hageo' },
  { id: 38, nombre: 'Zacarías' },
  { id: 39, nombre: 'Malaquías' },
  { id: 40, nombre: 'Mateo' },
  { id: 41, nombre: 'Marcos' },
  { id: 42, nombre: 'Lucas' },
  { id: 43, nombre: 'Juan' },
  { id: 44, nombre: 'Hechos' },
  { id: 45, nombre: 'Romanos' },
  { id: 46, nombre: '1 Corintios' },
  { id: 47, nombre: '2 Corintios' },
  { id: 48, nombre: 'Gálatas' },
  { id: 49, nombre: 'Efesios' },
  { id: 50, nombre: 'Filipenses' },
  { id: 51, nombre: 'Colosenses' },
  { id: 52, nombre: '1 Tesalonicenses' },
  { id: 53, nombre: '2 Tesalonicenses' },
  { id: 54, nombre: '1 Timoteo' },
  { id: 55, nombre: '2 Timoteo' },
  { id: 56, nombre: 'Tito' },
  { id: 57, nombre: 'Filemón' },
  { id: 58, nombre: 'Hebreos' },
  { id: 59, nombre: 'Santiago' },
  { id: 60, nombre: '1 Pedro' },
  { id: 61, nombre: '2 Pedro' },
  { id: 62, nombre: '1 Juan' },
  { id: 63, nombre: '2 Juan' },
  { id: 64, nombre: '3 Juan' },
  { id: 65, nombre: 'Judas' },
  { id: 66, nombre: 'Apocalipsis' },
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const ENTRADAS = LIBROS.flatMap((libro) =>
  [libro.nombre, ...(libro.alias ?? [])].map((nombre) => ({ id: libro.id, nombreCanonico: libro.nombre, nombre })),
);

// Los nombres más largos van primero para que "1 Juan" no quede capturado por "Juan".
const PATRON_REFERENCIA = new RegExp(
  `^\\s*(${ENTRADAS.map((e) => escapeRegex(e.nombre))
    .sort((a, b) => b.length - a.length)
    .join('|')})\\s+(\\d{1,3})(?::(\\d{1,3})(?:-(\\d{1,3}))?)?\\s*$`,
  'i',
);

export function parseReferencia(referencia: string): ReferenciaParseada | null {
  const match = referencia.match(PATRON_REFERENCIA);
  if (!match) return null;

  const nombreEncontrado = match[1].toLowerCase();
  const entrada = ENTRADAS.find((e) => e.nombre.toLowerCase() === nombreEncontrado);
  if (!entrada) return null;

  const capitulo = parseInt(match[2], 10);
  const versoInicio = match[3] ? parseInt(match[3], 10) : undefined;
  const versoFin = match[4] ? parseInt(match[4], 10) : versoInicio;

  return { libro: entrada.nombreCanonico, bookId: entrada.id, capitulo, versoInicio, versoFin };
}
