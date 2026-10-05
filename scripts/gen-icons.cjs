const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BG = '#1f1915'; // cuero
const FG = '#c9aa5e'; // dorado
const LISTON = '#9a3340'; // listón, un tono más claro para que se lea sobre el cuero

// Logo: una Biblia (tapa con lomo) con una cruz y un listón que cuelga por debajo.
// Mismo dibujo que src/components/Logo.tsx. Centramos según el área que realmente
// ocupan los trazos (incluyendo medio grosor y el listón) para que se vea balanceado.
const STROKE_W = 1.3;
const BBOX = { x: 4.5 - STROKE_W / 2, y: 2 - STROKE_W / 2, w: 13.5 + STROKE_W, h: 23.6 - (2 - STROKE_W / 2) };

function buildSvg(size) {
  const iconBoxRatio = 0.6;
  const iconSize = size * iconBoxRatio;
  const scale = iconSize / Math.max(BBOX.w, BBOX.h);
  const drawnW = BBOX.w * scale;
  const drawnH = BBOX.h * scale;
  const offsetX = (size - drawnW) / 2 - BBOX.x * scale;
  const offsetY = (size - drawnH) / 2 - BBOX.y * scale;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BG}" />
  <g transform="translate(${offsetX} ${offsetY}) scale(${scale})" fill="none" stroke="${FG}" stroke-width="${STROKE_W}" stroke-linecap="round" stroke-linejoin="round">
    <!-- tapa y lomo -->
    <rect x="4.5" y="2" width="13.5" height="17.5" rx="1.3" />
    <line x1="7.2" y1="2" x2="7.2" y2="19.5" />
    <!-- cruz -->
    <line x1="12.6" y1="6" x2="12.6" y2="14.2" />
    <line x1="9.9" y1="8.6" x2="15.3" y2="8.6" />
    <!-- listón -->
    <path d="M14.4 20.15 H16.2 V23.6 L15.3 22.7 L14.4 23.6 Z" fill="${LISTON}" stroke="none" />
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
