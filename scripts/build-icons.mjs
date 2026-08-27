#!/usr/bin/env node
/**
 * Regenera todos los iconos desde el maestro. Se ejecuta a mano cuando cambia el
 * logotipo, no en cada build: los derivados se versionan para que un clon limpio no
 * necesite nada mas que node.
 *
 *   npm run icons
 *
 * El maestro es un cuadrado redondeado de fondo crema sobre esquinas NEGRAS. Esa
 * es la razon de este script: cualquier derivado que se limite a escalar el maestro
 * arrastra las esquinas negras, y en Android el icono maskable se veia con un marco
 * negro alrededor. Aqui se recorta el interior, se mide el color del fondo y se
 * rellena con el, y las esquinas se hacen transparentes donde el formato lo admite.
 *
 * Sin dependencias: PNG de 8 bits sin entrelazar, que es lo que exporta el maestro.
 * Detalle de cada derivado en docs/pwa.md.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync, inflateSync } from 'node:zlib';

const MASTER = 'assets/logo-master.png';

// Margen que se descarta del maestro para quedarse solo con el interior crema. En
// la diagonal el negro llega hasta unos 63 px; 80 deja holgura.
const INTERIOR_INSET = 80;

// Zona segura de un icono maskable: un circulo del 80 por ciento del lado. Lo que
// quede fuera puede desaparecer bajo la mascara del lanzador.
const SAFE_ZONE = 0.8;

// El maestro se escala a la zona segura entero, con sus margenes: verificado que asi
// la palabra LOMITO queda justo dentro del circulo y las orejas del perro tambien.
const MASKABLE_SCALE = SAFE_ZONE;

// Las esquinas redondeadas del icono "any" se recortan un poco por dentro del borde
// real del arte, para no arrastrar el antialias gris que hay entre el crema y el negro.
const CORNER_INSET = 4;

// ── PNG ───────────────────────────────────────────────────────────────────────

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const BYTES_PER_PIXEL = { 0: 1, 2: 3, 4: 2, 6: 4 };

/**
 * Decodifica un PNG de 8 bits sin entrelazar a RGBA.
 *
 * @param {Buffer} buffer Archivo completo.
 * @returns {{ width: number, height: number, data: Uint8ClampedArray }}
 * @throws {Error} Si el archivo no es un PNG soportado.
 */
function decodePng(buffer) {
  if (!buffer.subarray(0, 8).equals(SIGNATURE)) throw new Error('No es un PNG');

  let width = 0;
  let height = 0;
  let colorType = 0;
  const idat = [];
  let offset = 8;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
      if (data[8] !== 8) throw new Error(`Profundidad de ${data[8]} bits no soportada`);
      if (data[12] !== 0) throw new Error('PNG entrelazado no soportado');
      if (!(colorType in BYTES_PER_PIXEL)) throw new Error('PNG con paleta no soportado');
    } else if (type === 'IDAT') {
      idat.push(data);
    }
    offset += 12 + length;
  }

  const bpp = BYTES_PER_PIXEL[colorType];
  const stride = width * bpp;
  const raw = inflateSync(Buffer.concat(idat));
  const data = new Uint8ClampedArray(width * height * 4);
  let previous = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    unfilter(line, previous, bpp, filter);
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      const s = x * bpp;
      if (bpp >= 3) {
        data[o] = line[s];
        data[o + 1] = line[s + 1];
        data[o + 2] = line[s + 2];
        data[o + 3] = bpp === 4 ? line[s + 3] : 255;
      } else {
        data[o] = data[o + 1] = data[o + 2] = line[s];
        data[o + 3] = bpp === 2 ? line[s + 1] : 255;
      }
    }
    previous = line;
  }
  return { width, height, data };
}

/** Deshace en sitio el filtro de una linea PNG. */
function unfilter(line, previous, bpp, filter) {
  for (let i = 0; i < line.length; i++) {
    const a = i >= bpp ? line[i - bpp] : 0;
    const b = previous[i];
    const c = i >= bpp ? previous[i - bpp] : 0;
    let value = line[i];
    if (filter === 1) value += a;
    else if (filter === 2) value += b;
    else if (filter === 3) value += (a + b) >> 1;
    else if (filter === 4) value += paeth(a, b, c);
    line[i] = value & 255;
  }
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

/**
 * Codifica una imagen RGBA como PNG, con o sin canal alfa.
 *
 * Cada linea elige el filtro que menos entropia deja, que es lo que hacen los
 * codificadores serios: sin esto una ilustracion pesa el doble.
 *
 * @param {{ width: number, height: number, data: Uint8ClampedArray }} image
 * @param {{ alpha: boolean }} options Con alfa se escribe RGBA; sin el, RGB.
 * @returns {Buffer}
 */
function encodePng(image, { alpha }) {
  const bpp = alpha ? 4 : 3;
  const stride = image.width * bpp;
  const raw = Buffer.alloc((stride + 1) * image.height);
  let previous = Buffer.alloc(stride);

  for (let y = 0; y < image.height; y++) {
    const line = Buffer.alloc(stride);
    for (let x = 0; x < image.width; x++) {
      const o = (y * image.width + x) * 4;
      line.set(image.data.subarray(o, o + bpp), x * bpp);
    }
    const { filter, filtered } = bestFilter(line, previous, bpp);
    raw[y * (stride + 1)] = filter;
    filtered.copy(raw, y * (stride + 1) + 1);
    previous = line;
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(image.width, 0);
  header.writeUInt32BE(image.height, 4);
  header[8] = 8;
  header[9] = alpha ? 6 : 2;
  return Buffer.concat([
    SIGNATURE,
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Prueba los cinco filtros PNG sobre una linea y devuelve el mas compacto. */
function bestFilter(line, previous, bpp) {
  let best = null;
  for (let filter = 0; filter < 5; filter++) {
    const filtered = Buffer.alloc(line.length);
    let cost = 0;
    for (let i = 0; i < line.length; i++) {
      const a = i >= bpp ? line[i - bpp] : 0;
      const b = previous[i];
      const c = i >= bpp ? previous[i - bpp] : 0;
      let predicted = 0;
      if (filter === 1) predicted = a;
      else if (filter === 2) predicted = b;
      else if (filter === 3) predicted = (a + b) >> 1;
      else if (filter === 4) predicted = paeth(a, b, c);
      const value = (line[i] - predicted) & 255;
      filtered[i] = value;
      cost += value < 128 ? value : 256 - value;
    }
    if (best === null || cost < best.cost) best = { filter, filtered, cost };
  }
  return best;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(data, crc32(typeBytes)), 0);
  return Buffer.concat([length, typeBytes, data, crc]);
}

// ── Operaciones de imagen ─────────────────────────────────────────────────────

/** Recorta un rectangulo. */
function crop(image, x0, y0, width, height) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    const from = ((y0 + y) * image.width + x0) * 4;
    data.set(image.data.subarray(from, from + width * 4), y * width * 4);
  }
  return { width, height, data };
}

/**
 * Reduce una imagen promediando el area que cubre cada pixel de destino, en alfa
 * premultiplicado para que un borde transparente no se oscurezca al mezclarse.
 */
function resize(image, width, height = width) {
  const premultiplied = new Float32Array(image.width * image.height * 4);
  for (let i = 0; i < image.width * image.height; i++) {
    const a = image.data[i * 4 + 3] / 255;
    premultiplied[i * 4] = image.data[i * 4] * a;
    premultiplied[i * 4 + 1] = image.data[i * 4 + 1] * a;
    premultiplied[i * 4 + 2] = image.data[i * 4 + 2] * a;
    premultiplied[i * 4 + 3] = image.data[i * 4 + 3];
  }

  const horizontal = resampleAxis(premultiplied, image.width, image.height, width, true);
  const vertical = resampleAxis(horizontal, width, image.height, height, false);

  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const a = vertical[i * 4 + 3];
    const factor = a > 0 ? 255 / a : 0;
    data[i * 4] = Math.round(vertical[i * 4] * factor);
    data[i * 4 + 1] = Math.round(vertical[i * 4 + 1] * factor);
    data[i * 4 + 2] = Math.round(vertical[i * 4 + 2] * factor);
    data[i * 4 + 3] = Math.round(a);
  }
  return { width, height, data };
}

/** Remuestrea un eje con pesos proporcionales al solape entre pixel origen y destino. */
function resampleAxis(source, width, height, target, horizontal) {
  const sourceLength = horizontal ? width : height;
  const otherLength = horizontal ? height : width;
  const outWidth = horizontal ? target : width;
  const outHeight = horizontal ? height : target;
  const out = new Float32Array(outWidth * outHeight * 4);
  const scale = sourceLength / target;

  for (let t = 0; t < target; t++) {
    const start = t * scale;
    const end = start + scale;
    const weights = [];
    for (let s = Math.floor(start); s < Math.min(Math.ceil(end), sourceLength); s++) {
      const overlap = Math.min(end, s + 1) - Math.max(start, s);
      if (overlap > 0) weights.push([s, overlap / scale]);
    }
    for (let o = 0; o < otherLength; o++) {
      const outIndex = (horizontal ? o * outWidth + t : t * outWidth + o) * 4;
      for (const [s, w] of weights) {
        const inIndex = (horizontal ? o * width + s : s * width + o) * 4;
        out[outIndex] += source[inIndex] * w;
        out[outIndex + 1] += source[inIndex + 1] * w;
        out[outIndex + 2] += source[inIndex + 2] * w;
        out[outIndex + 3] += source[inIndex + 3] * w;
      }
    }
  }
  return out;
}

/** Dibuja la imagen centrada sobre un lienzo cuadrado opaco de un color. */
function compose(image, size, [r, g, b]) {
  const data = new Uint8ClampedArray(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  const x0 = Math.round((size - image.width) / 2);
  const y0 = Math.round((size - image.height) / 2);
  for (let y = 0; y < image.height; y++) {
    const from = y * image.width * 4;
    data.set(image.data.subarray(from, from + image.width * 4), ((y0 + y) * size + x0) * 4);
  }
  return { width: size, height: size, data };
}

/**
 * Vuelve transparente todo lo que quede fuera de un rectangulo redondeado, con el
 * borde suavizado a partir de la distancia con signo a la forma.
 */
function roundCorners(image, radius, inset) {
  const data = new Uint8ClampedArray(image.data);
  const half = image.width / 2 - inset;
  const center = image.width / 2;
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const qx = Math.abs(x + 0.5 - center) - (half - radius);
      const qy = Math.abs(y + 0.5 - center) - (half - radius);
      const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
      const distance = outside + Math.min(Math.max(qx, qy), 0) - radius;
      const coverage = Math.min(Math.max(0.5 - distance, 0), 1);
      const o = (y * image.width + x) * 4;
      data[o + 3] = Math.round(image.data[o + 3] * coverage);
    }
  }
  return { width: image.width, height: image.height, data };
}

// ── Medidas sobre el maestro ──────────────────────────────────────────────────

const luma = (data, o) => 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2];

/**
 * Radio de las esquinas del arte, medido en la diagonal: el primer pixel claro esta
 * a r(1 - 1/sqrt 2) del vertice. Es mas fiable que buscarlo en el borde, donde el
 * arco se separa del lado tan despacio que el antialias adelanta el resultado.
 */
function measureCornerRadius(image) {
  for (let d = 0; d < image.width / 2; d++) {
    if (luma(image.data, (d * image.width + d) * 4) > 128) return d / (1 - Math.SQRT1_2);
  }
  throw new Error('No se encuentra el borde del arte en la diagonal');
}

/** Color de fondo del arte: mediana del anillo exterior del interior recortado. */
function measureBackground(interior) {
  const samples = [[], [], []];
  const band = 10;
  for (let y = 0; y < interior.height; y++) {
    for (let x = 0; x < interior.width; x++) {
      const inBand =
        x < band || y < band || x >= interior.width - band || y >= interior.height - band;
      if (!inBand) continue;
      const o = (y * interior.width + x) * 4;
      for (let c = 0; c < 3; c++) samples[c].push(interior.data[o + c]);
    }
  }
  return samples.map((channel) => channel.sort((a, b) => a - b)[channel.length >> 1]);
}

/**
 * Pixeles de las esquinas negras del maestro, con su antialias: inundacion desde
 * los cuatro vertices sobre todo lo que no sea crema. El arco crema los aisla del
 * negro legitimo del arte, como las letras y las orejas.
 */
function floodCorners(image) {
  const outside = new Uint8Array(image.width * image.height);
  const last = image.width - 1;
  const queue = [
    [0, 0],
    [last, 0],
    [0, last],
    [last, last],
  ];
  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x > last || y > last) continue;
    const index = y * image.width + x;
    if (outside[index] || luma(image.data, index * 4) >= 200) continue;
    outside[index] = 1;
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return outside;
}

/**
 * Comprueba que la mascara redondeada no deja ver ni un pixel de las esquinas
 * negras ni de su antialias. Falla en vez de generar un icono con marco.
 */
function assertNoBlackCorners(image, outside) {
  for (let index = 0; index < outside.length; index++) {
    if (outside[index] && image.data[index * 4 + 3] > 0) {
      const x = index % image.width;
      const y = Math.floor(index / image.width);
      throw new Error(`Queda negro visible en (${x}, ${y}): sube CORNER_INSET`);
    }
  }
}

// ── Derivados ─────────────────────────────────────────────────────────────────

const master = decodePng(readFileSync(MASTER));
if (master.width !== master.height) throw new Error('El maestro tiene que ser cuadrado');

const side = master.width;
const interior = crop(
  master,
  INTERIOR_INSET,
  INTERIOR_INSET,
  side - 2 * INTERIOR_INSET,
  side - 2 * INTERIOR_INSET,
);
const background = measureBackground(interior);
const radius = measureCornerRadius(master);
console.log(`Maestro ${side}px, radio ${radius.toFixed(0)}px, fondo rgb(${background.join(', ')})`);

const write = (path, image, alpha) => {
  const png = encodePng(image, { alpha });
  writeFileSync(path, png);
  console.log(`  ${path} (${image.width}px, ${(png.length / 1024).toFixed(0)} kB)`);
};

// Icono "any" y favicons: el arte tal cual, con las esquinas transparentes. Es lo
// que ve el escritorio, el dialogo de instalacion y la pantalla de arranque.
console.log('Iconos any con esquinas transparentes');
const rounded = roundCorners(master, radius, CORNER_INSET);
assertNoBlackCorners(rounded, floodCorners(master));
for (const [path, size] of [
  ['public/icon-512.png', 512],
  ['public/icon-192.png', 192],
  ['public/favicon-32.png', 32],
  ['public/favicon-16.png', 16],
]) {
  write(path, resize(rounded, size), true);
}

// Maskable: Android recorta a la forma que decida el lanzador, asi que el fondo
// tiene que llegar hasta el borde y ser del mismo color que el arte. El arte se
// reduce a la zona segura para que ninguna forma se lleve el texto.
console.log('Icono maskable a sangre');
const maskableScale = (512 * MASKABLE_SCALE) / side;
write(
  'public/icon-maskable-512.png',
  compose(resize(interior, Math.round(interior.width * maskableScale)), 512, background),
  false,
);

// Apple: iOS aplica su propia mascara y pinta de negro cualquier transparencia, asi
// que va opaco y a sangre, con las esquinas del maestro rellenas del color del fondo.
console.log('Icono de Apple opaco');
write(
  'public/apple-touch-icon.png',
  compose(resize(interior, Math.round((interior.width * 180) / side)), 180, background),
  false,
);

// Marca de la cabecera: solo la cabeza. El logotipo completo lleva el texto dentro y
// a 32px no se lee. Las coordenadas son del maestro de 1254 px.
console.log('Marca de la cabecera');
write('src/assets/logo-mark.png', resize(crop(master, 300, 20, 500, 500), 96), false);

console.log('Listo.');
