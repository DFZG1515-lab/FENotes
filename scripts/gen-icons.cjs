const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BG = '#5b7a63'; // sage
const FG = '#faf7f2'; // cream

// Logo: una hoja de notas con una pluma de ave dibujando una cruz, estilo línea minimalista.
function buildSvg(size) {
  const iconBoxRatio = 0.62;
  const iconSize = size * iconBoxRatio;
  const scale = iconSize / 24;
  const offset = (size - iconSize) / 2;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BG}" />
  <g transform="translate(${offset} ${offset}) scale(${scale})" fill="none" stroke="${FG}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <!-- hoja de notas -->
    <rect x="3" y="2.5" width="13.5" height="19" rx="1.3" />
    <!-- cruz dibujada en la hoja -->
    <line x1="9.7" y1="6.2" x2="9.7" y2="16.5" />
    <line x1="6.4" y1="9.3" x2="13" y2="9.3" />
    <!-- pluma de ave: asta -->
    <line x1="9.7" y1="16.5" x2="19.5" y2="4.2" />
    <!-- pluma de ave: barbas (plumón) -->
    <path d="M11.3 14.4 C13.5 13.6 15.8 11.4 17.2 8.6 C18 7 18.5 5.6 18.7 4.6 C17.7 5.1 16.2 6 14.7 7.6 C12.5 9.9 11.4 12.5 11.3 14.4 Z" />
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
