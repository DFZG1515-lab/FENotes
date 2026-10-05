const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BG = '#f4efe4'; // papel
const LISTON = '#7a1f2b'; // listón

// Logo: el listón separador de la Biblia, colgando desde el borde superior del ícono.
// Se dibuja en una caja de 24×24 que es todo el ícono. Mismo dibujo que src/components/Logo.tsx.
function buildSvg(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" fill="${BG}" />
  <path d="M9.2 0h5.6v15.5L12 13l-2.8 2.5z" fill="${LISTON}" />
</svg>`;
}

async function main() {
  const outDir = path.join(__dirname, '..', 'public', 'icons');
  fs.mkdirSync(outDir, { recursive: true });

  for (const size of [192, 512]) {
    const svg = buildSvg(size);
    await sharp(Buffer.from(svg)).png().toFile(path.join(outDir, `icon-${size}.png`));
  }

  console.log('Icons generated in', outDir);
}

main();
