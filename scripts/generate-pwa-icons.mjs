// Brand mark for the member PWA: black tile, yellow circle, letter M.
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "../public/icons");

const INK = [0x11, 0x11, 0x11, 255];
const YELLOW = [0xf5, 0xc4, 0x00, 255];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(size, paint) {
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = paint(x + 0.5, y + 0.5, size);
      const i = y * stride + 1 + x * 4;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function distToSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function blend(base, over, amount) {
  const a = Math.max(0, Math.min(1, amount));
  return base.map((c, i) => Math.round(c + (over[i] - c) * a));
}

/** @param {boolean} maskable full-bleed background for OS masks */
function paint(x, y, size, maskable) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  let color = [0, 0, 0, 0];

  if (maskable) {
    color = INK;
  } else {
    const radius = s * 0.22;
    const dx = Math.max(Math.abs(x - cx) - (s / 2 - radius), 0);
    const dy = Math.max(Math.abs(y - cy) - (s / 2 - radius), 0);
    const outside = Math.hypot(dx, dy) - radius;
    color = blend(color, INK, 1 - Math.max(0, Math.min(1, outside + 0.6)));
  }

  const circleR = s * (maskable ? 0.3 : 0.34);
  const circleEdge = Math.hypot(x - cx, y - cy) - circleR;
  color = blend(color, YELLOW, 1 - Math.max(0, Math.min(1, circleEdge + 0.6)));

  const m = [
    [0.34, 0.66, 0.34, 0.36],
    [0.34, 0.36, 0.5, 0.54],
    [0.5, 0.54, 0.66, 0.36],
    [0.66, 0.36, 0.66, 0.66],
  ];
  const half = s * 0.045;
  let stroke = Infinity;
  for (const [ax, ay, bx, by] of m) {
    stroke = Math.min(
      stroke,
      distToSeg(x / s, y / s, ax, ay, bx, by) * s - half,
    );
  }
  return blend(color, INK, 1 - Math.max(0, Math.min(1, stroke + 0.6)));
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "icon-192.png"), png(192, (x, y, s) => paint(x, y, s, false)));
writeFileSync(join(OUT, "icon-512.png"), png(512, (x, y, s) => paint(x, y, s, false)));
writeFileSync(join(OUT, "icon-maskable-512.png"), png(512, (x, y, s) => paint(x, y, s, true)));
writeFileSync(join(OUT, "apple-touch-icon.png"), png(180, (x, y, s) => paint(x, y, s, false)));
console.log("[pwa] icons written to public/icons");
