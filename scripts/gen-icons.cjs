const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BG = '#5b7a63'; // sage
const FG = '#faf7f2'; // cream

// Logo: una hoja de notas con una cruz dibujada, estilo línea minimalista.
// El bbox real del dibujo (incluyendo medio grosor de trazo) no es el viewBox nominal 24x24,
// así que centramos según el área que realmente ocupan los trazos para que se vea balanceado.
const STROKE_W = 1.4;
const BBOX = { x: 3 - STROKE_W / 2, y: 2.5 - STROKE_W / 2, w: 13.5 + STROKE_W, h: 19 + STROKE_W };

function buildSvg(size) {
  const iconBoxRatio = 0.62;
  const iconSize = size * iconBoxRatio;
  const scale = iconSize / Math.max(BBOX.w, BBOX.h);
  const drawnW = BBOX.w * scale;
  const drawnH = BBOX.h * scale;
  const offsetX = (size - drawnW) / 2 - BBOX.x * scale;
  const offsetY = (size - drawnH) / 2 - BBOX.y * scale;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BG}" />
  <g transform="translate(${offsetX} ${offsetY}) scale(${scale})" fill="none" stroke="${FG}" stroke-width="${STROKE_W}" stroke-linecap="round" stroke-linejoin="round">
    <!-- hoja de notas -->
    <rect x="3" y="2.5" width="13.5" height="19" rx="1.3" />
    <!-- cruz dibujada en la hoja -->
    <line x1="9.7" y1="6.2" x2="9.7" y2="16.5" />
    <line x1="6.4" y1="9.3" x2="13" y2="9.3" />
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
