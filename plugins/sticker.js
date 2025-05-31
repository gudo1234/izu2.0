import sharp from 'sharp';
import fetch from 'node-fetch';
import { sticker } from '../lib/sticker.js';
import fs from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { randomUUID } from 'crypto';

const shapeFlags = {
  '-c': 'circle', '-t': 'triangle', '-d': 'diamond', '-g': 'hexagon', '-p': 'pentagon',
  '-a': 'heart', '-b': 'blob', '-l': 'leaf', '-n': 'moon', '-s': 'star', '-z': 'zap',
  '-r': 'curve', '-e': 'edges', '-m': 'mirror', '-f': 'arrow', '-x': 'attach', '-i': 'expand',
  '-h': 'flip-horizontal', '-v': 'flip-vertical'
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const thumbnail = await (await fetch(icono)).buffer();
  const selectedFlag = args.find(arg => Object.keys(shapeFlags).includes(arg));
  const selectedShape = shapeFlags[selectedFlag] || null;

  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || q.mediaType || '';
  let img;

  if (/webp|image|video|gif/.test(mime)) {
    if (/video/.test(mime) && (q.msg || q).seconds > 8)
      return m.reply('🎥 El video no puede durar más de 8 segundos.');
    img = await q.download?.();
  } else if (args[0] && isUrl(args[0])) {
    img = await fetch(args[0]).then(res => res.buffer());
    mime = 'image/url';
  } else {
    return conn.reply(m.chat, mensajeForma(usedPrefix, command), m);
  }

  m.react('🛠️');

  try {
    const isAnimated = /video|mp4|gif/.test(mime) && !selectedShape;
    const isVideoFrame = /video|mp4|gif/.test(mime) && selectedShape;

    if (isVideoFrame) {
      const tmpIn = path.join(tmpdir(), `${randomUUID()}.mp4`);
      const tmpOut = path.join(tmpdir(), `${randomUUID()}.png`);
      await fs.writeFile(tmpIn, img);
      await sharp(tmpIn, { pages: 1 }).toFile(tmpOut);
      img = await fs.readFile(tmpOut);
      await fs.unlink(tmpIn).catch(() => {});
      await fs.unlink(tmpOut).catch(() => {});
    }

    let bufferProcesado;

    if (selectedShape === 'flip-horizontal') {
      bufferProcesado = await sharp(img).flip().webp().toBuffer();
    } else if (selectedShape === 'flip-vertical') {
      bufferProcesado = await sharp(img).flop().webp().toBuffer();
    } else if (selectedShape) {
      const masked = await applyShapeMask(img, selectedShape, 512);
      bufferProcesado = await sharp(masked).webp().toBuffer();
    } else {
      bufferProcesado = img; // Autosticker puro
    }

    const resultado = await sticker(bufferProcesado, isAnimated, m.pushName);
    if (resultado) {
      return conn.sendFile(m.chat, resultado, 'sticker.webp', '', m, true, {
        contextInfo: {
          forwardingScore: 200,
          isForwarded: false,
          externalAdReply: {
            showAdAttribution: false,
            title: `${m.pushName}`,
            body: textbot,
            mediaType: 1,
            sourceUrl: redes,
            thumbnail,
            thumbnailUrl: redes
          }
        }
      });
    }
  } catch (e) {
    console.error(e);
    return m.reply('⚠️ Ocurrió un error al crear el sticker.');
  }
};

handler.group = true;
handler.command = ['s', 'sticker', 'stiker'];
export default handler;

// Utils

function isUrl(text) {
  return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|mp4)$/i.test(text);
}

function mensajeForma(prefix, cmd) {
  return `${e} _Responde a una *imagen, video o GIF* para crear un sticker. También puedes agregar una forma personalizada con una opción._

┌🎨 \`Formas disponibles:\`
│
│ ● *Básicas*
│ ├─ -c → Circular
│ ├─ -t → Triangular
│ ├─ -d → Diamante
│ ├─ -g → Hexágono
│ └─ -p → Pentágono
│
│ ● *Decorativas*
│ ├─ -a → Corazón
│ ├─ -b → Burbuja
│ ├─ -l → Hoja
│ ├─ -n → Luna
│ ├─ -s → Estrella
│ └─ -z → Rayo
│
│ ● *Especiales*
│ ├─ -r → Curvado
│ ├─ -e → Esquinas redondeadas
│ ├─ -m → Espejo
│ ├─ -f → Flecha
│ ├─ -x → Acoplado
│ ├─ -i → Ampliado
│ ├─ -h → Horizontal
│ └─ -v → Vertical
└──────────

◈ *Ejemplo:* responde a una imagen con: \`${prefix + cmd} -a\``;
}

async function applyShapeMask(imageBuffer, shape = 'circle', size = 512) {
  const svgMask = getSVGMask(shape, size);
  return await sharp(imageBuffer)
    .ensureAlpha()
    .resize(size, size, { fit: sharp.fit.fill })
    .composite([{ input: Buffer.from(svgMask), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

function getSVGMask(shape, size = 512) {
  const center = size / 2;
  const radius = size / 2;

  const shapes = {
    circle: `<circle cx="${center}" cy="${center}" r="${radius}" fill="white"/>`,
    triangle: `<polygon points="${center},0 ${size},${size} 0,${size}" fill="white"/>`,
    diamond: `<polygon points="${center},0 ${size},${center} ${center},${size} 0,${center}" fill="white"/>`,
    hexagon: `<polygon points="${size * 0.25},0 ${size * 0.75},0 ${size},${center} ${size * 0.75},${size} ${size * 0.25},${size} 0,${center}" fill="white"/>`,
    pentagon: `<polygon points="${center},0 ${size},${size * 0.4} ${size * 0.8},${size} ${size * 0.2},${size} 0,${size * 0.4}" fill="white"/>`,
    heart: `<path d="M${center},${size} C${-size * 0.2},${size * 0.4} ${center},${-size * 0.1} ${center},${size * 0.4} C${center},${-size * 0.1} ${size * 1.2},${size * 0.4} ${center},${size} Z" fill="white"/>`,
    blob: `<path d="M${center},${center} m-${radius},0 a${radius},${radius} 0 1,0 ${radius * 2},0 a${radius},${radius} 0 1,0 -${radius * 2},0" fill="white"/>`,
    leaf: `<path d="M${center},0 C${size},${center} ${center},${size} 0,${center} C${center},${center * 0.3} ${center},${center * 0.3} ${center},0 Z" fill="white"/>`,
    moon: `<path d="M${center},0 A${radius},${radius} 0 1,0 ${center},${size} A${radius * 0.6},${radius * 0.6} 0 1,1 ${center},0 Z" fill="white"/>`,
    star: `<polygon points="${center},0 ${center * 1.2},${center * 0.7} ${size},${center} ${center * 1.2},${center * 1.3} ${center},${size} ${center * 0.8},${center * 1.3} 0,${center} ${center * 0.8},${center * 0.7}" fill="white"/>`,
    zap: `<polygon points="${center * 0.7},0 ${center * 1.3},${center} ${center},${center} ${center * 1.3},${size} ${center * 0.7},${center} ${center},${center} " fill="white"/>`,
    curve: `<path d="M0,${center} Q${center},0 ${size},${center} Q${center},${size} 0,${center}" fill="white"/>`,
    edges: `<rect x="0" y="0" width="${size}" height="${size}" rx="${size * 0.2}" ry="${size * 0.2}" fill="white"/>`,
    mirror: `<path d="M0,0 H${center} V${size} H0 Z M${center},0 H${size} V${size} H${center} Z" fill="white"/>`,
    arrow: `<path d="M0,${center} H${size * 0.6} L${size * 0.4},${center * 0.6} M${size * 0.6},${center} L${size * 0.4},${center * 1.4}" stroke="white" stroke-width="${size * 0.1}" fill="none"/>`,
    attach: `<circle cx="${center}" cy="${center}" r="${radius}" fill="white"/><rect x="${center * 0.2}" y="${center * 0.2}" width="${center}" height="${center}" fill="black"/>`,
    expand: `<path d="M0,${center} Q${center},0 ${size},${center} Q${center},${size} 0,${center}" fill="white"/>`
  };

  const content = shapes[shape] || shapes.circle;
  return `<svg width="${size}" height="${size}"><rect width="100%" height="100%" fill="black"/><g>${content}</g></svg>`;
}
