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

function makePng(size, bg, fg) {
  const width = size, height = size;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  const margin = Math.floor(size * 0.22);
  const bookW = size - margin * 2;
  const bookH = Math.floor(bookW * 0.78);
  const bookX = margin;
  const bookY = Math.floor((size - bookH) / 2);
  const spineX = Math.floor(size / 2);

  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < width; x++) {
      const idx = rowStart + 1 + x * 4;
      let [r, g, b] = bg;
      const inBook = x >= bookX && x < bookX + bookW && y >= bookY && y < bookY + bookH;
      if (inBook) {
        const nearSpine = Math.abs(x - spineX) < Math.max(2, size * 0.012);
        [r, g, b] = nearSpine ? fg.map(v => Math.max(0, v - 30)) : fg;
      }
      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
      raw[idx + 3] = 255;
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
  const png = Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  return png;
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

const bg = [91, 122, 99]; // brand green #5b7a63
const fg = [250, 247, 242]; // cream #faf7f2

fs.writeFileSync(path.join(outDir, 'icon-192.png'), makePng(192, bg, fg));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), makePng(512, bg, fg));

console.log('Icons generated in', outDir);
