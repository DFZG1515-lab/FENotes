const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (crc ^ buf[i]) & 0xff;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function mix(c1, c2, t) {
  return c1.map((v, i) => Math.round(v + (c2[i] - v) * t));
}

// Dibuja un libro abierto con un marcador (cinta) cayendo desde arriba: logo de FeNotes.
function makePng(size, bg, fg, accent) {
  const width = size, height = size;
  const raw = Buffer.alloc((width * 4 + 1) * height);

  const margin = Math.floor(size * 0.16);
  const bookW = size - margin * 2;
  const bookH = Math.floor(bookW * 0.7);
  const bookX = margin;
  const bookY = size - margin - bookH;
  const spineX = size / 2;

  const pageCurve = bookH * 0.16; // qué tanto "se abren" las páginas hacia los lados

  const ribbonW = Math.max(4, size * 0.085);
  const ribbonX = size / 2 - ribbonW / 2 + size * 0.06;
  const ribbonTop = margin;
  const ribbonBottom = bookY + bookH * 0.42;
  const notchDepth = ribbonW * 0.9;

  function setPixel(idx, color) {
    raw[idx] = color[0];
    raw[idx + 1] = color[1];
    raw[idx + 2] = color[2];
    raw[idx + 3] = 255;
  }

  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < width; x++) {
      const idx = rowStart + 1 + x * 4;
      let color = bg;

      // Páginas del libro: rectángulo con el borde superior ligeramente curvo hacia arriba en los extremos.
      const distFromSpine = Math.abs(x - spineX) / (bookW / 2);
      const curveOffset = distFromSpine * distFromSpine * pageCurve;
      const topEdge = bookY + curveOffset;

      const inBook = x >= bookX && x < bookX + bookW && y >= topEdge && y < bookY + bookH;
      if (inBook) {
        const nearSpine = Math.abs(x - spineX) < Math.max(2, size * 0.01);
        color = nearSpine ? mix(fg, bg, 0.35) : fg;
      }

      // Cinta marcadora cayendo desde arriba del libro, con punta en V.
      const inRibbonX = x >= ribbonX && x < ribbonX + ribbonW;
      if (inRibbonX && y >= ribbonTop && y < ribbonBottom) {
        const remaining = ribbonBottom - y;
        const cutoff = remaining < notchDepth
          ? notchDepth - remaining
          : 0;
        const distFromRibbonCenter = Math.abs(x - (ribbonX + ribbonW / 2));
        if (distFromRibbonCenter < ribbonW / 2 - cutoff) {
          color = accent;
        }
      }

      setPixel(idx, color);
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(raw, { level: 9 });

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

const bg = [91, 122, 99]; // sage #5b7a63
const fg = [250, 247, 242]; // cream #faf7f2
const accent = [201, 138, 94]; // clay #c98a5e

fs.writeFileSync(path.join(outDir, 'icon-192.png'), makePng(192, bg, fg, accent));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), makePng(512, bg, fg, accent));

console.log('Icons generated in', outDir);
