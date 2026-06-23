const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Paths exactos del ícono "book-open-text" de lucide-react (viewBox 0 0 24 24).
const ICON_PATHS = [
  'M12 7v14',
  'M16 12h2',
  'M16 8h2',
  'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z',
  'M6 12h2',
  'M6 8h2',
];

const BG = '#5b7a63'; // sage
const FG = '#faf7f2'; // cream

function buildSvg(size) {
  const iconBoxRatio = 0.56; // misma proporción ícono/contenedor que el header de la app
  const iconSize = size * iconBoxRatio;
  const scale = iconSize / 24;
  const offset = (size - iconSize) / 2;

  const paths = ICON_PATHS.map((d) => `<path d="${d}" />`).join('');

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BG}" />
  <g transform="translate(${offset} ${offset}) scale(${scale})" fill="none" stroke="${FG}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    ${paths}
  </g>
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
