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
      return m.reply('¡El video no puede durar más de 8 segundos!');
    img = await q.download?.();
  } else if (args[0] && isUrl(args[0])) {
    img = await fetch(args[0]).then(res => res.buffer());
    mime = 'image/url';
  } else {
    return conn.reply(m.chat, mensajeForma(usedPrefix, command), m);
  }

  m.react('🧩');

  try {
    const isAnimated = /video|mp4|gif/.test(mime) && !selectedShape;
    const isVideoFrame = /video|mp4|gif/.test(mime) && selectedShape;

    // Sacamos primer frame si es video y requiere forma
    if (isVideoFrame) {
      const tmpIn = path.join(tmpdir(), `${randomUUID()}.mp4`);
      const tmpOut = path.join(tmpdir(), `${randomUUID()}.png`);
      await fs.writeFile(tmpIn, img);
      await sharp(tmpIn, { pages: 1 }).toFile(tmpOut);
      img = await fs.readFile(tmpOut);
      await fs.unlink(tmpIn).catch(() => {});
      await fs.unlink(tmpOut).catch(() => {});
    }

    // Procesar con forma o flip si corresponde
    let bufferProcesado;
    if (selectedShape === 'flip-horizontal') {
      bufferProcesado = await sharp(img).flip().resize(512, 512, { fit: 'contain' }).webp().toBuffer();
    } else if (selectedShape === 'flip-vertical') {
      bufferProcesado = await sharp(img).flop().resize(512, 512, { fit: 'contain' }).webp().toBuffer();
    } else if (selectedShape) {
      const masked = await applyShapeMask(img, selectedShape, 500);
      bufferProcesado = await sharp(masked).ensureAlpha().resize(512, 512, { fit: 'contain' }).webp().toBuffer();
    } else {
      bufferProcesado = img;
    }

    // Llamamos al generador de sticker
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

// Helpers

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

async function applyShapeMask(imageBuffer, shape = 'circle', size = 500) {
  const svgMask = getSVGMask(shape, size);
  return await sharp(imageBuffer)
    .ensureAlpha()
    .resize(size, size, { fit: sharp.fit.fill })
    .composite([{ input: Buffer.from(svgMask), blend: 'dest-in' }])
    .png()
    .toBuffer();
}
