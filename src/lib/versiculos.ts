const LIBROS = [
  'Génesis', 'Exodo', 'Éxodo', 'Levítico', 'Números', 'Deuteronomio', 'Josué', 'Jueces', 'Rut',
  'Samuel', 'Reyes', 'Crónicas', 'Esdras', 'Nehemías', 'Ester', 'Job', 'Salmos', 'Salmo',
  'Proverbios', 'Eclesiastés', 'Cantares', 'Isaías', 'Jeremías', 'Lamentaciones', 'Ezequiel',
  'Daniel', 'Oseas', 'Joel', 'Amós', 'Abdías', 'Jonás', 'Miqueas', 'Nahúm', 'Habacuc', 'Sofonías',
  'Hageo', 'Zacarías', 'Malaquías', 'Mateo', 'Marcos', 'Lucas', 'Juan', 'Hechos', 'Romanos',
  'Corintios', 'Gálatas', 'Efesios', 'Filipenses', 'Colosenses', 'Tesalonicenses', 'Timoteo',
  'Tito', 'Filemón', 'Hebreos', 'Santiago', 'Pedro', 'Judas', 'Apocalipsis',
];

const PATRON_VERSICULO = new RegExp(
  `\\b(?:[1-3]\\s?)?(?:${LIBROS.join('|')})\\s+\\d{1,3}(?::\\d{1,3}(?:-\\d{1,3})?)?`,
  'gi',
);

function normalizar(referencia: string): string {
  return referencia.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function detectarVersiculos(texto: string): string[] {
  const coincidencias = texto.match(PATRON_VERSICULO) ?? [];
  const vistos = new Set<string>();
  const resultado: string[] = [];
  for (const m of coincidencias) {
    const limpio = m.trim().replace(/\s+/g, ' ');
    const clave = normalizar(limpio);
    if (!vistos.has(clave)) {
      vistos.add(clave);
      resultado.push(limpio);
    }
  }
  return resultado;
}

export { normalizar as normalizarReferencia };
