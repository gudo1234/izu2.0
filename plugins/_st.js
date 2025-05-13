import sharp from 'sharp';
import fetch from 'node-fetch';
import { spawn } from 'child_process';
import { sticker } from '../lib/sticker.js';
import uploadFile from '../lib/uploadFile.js';
import uploadImage from '../lib/uploadImage.js';
import { webp2png } from '../lib/webp2mp4.js';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const shapeFlags = {
    '-c': 'circle', '-t': 'triangle', '-d': 'diamond', '-h': 'hexagon', '-p': 'pentagon',
    '-a': 'heart', '-b': 'blob', '-l': 'leaf', '-n': 'moon', '-s': 'star', '-z': 'zap',
    '-r': 'curve', '-e': 'edges', '-m': 'mirror', '-f': 'arrow', '-x': 'attach', '-i': 'expand'
  };

  const selectedFlag = args.find(arg => Object.keys(shapeFlags).includes(arg));
  const selectedShape = shapeFlags[selectedFlag] || null;

  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || q.mediaType || '';
  let mediaBuffer;

  if (/webp|image|video|gif/g.test(mime)) {
    if (/video/g.test(mime) && (q.msg || q).seconds > 10)
      return m.reply('¡El video no puede durar más de 10 segundos!');
    mediaBuffer = await q.download?.();
  } else if (args[0] && isUrl(args[0])) {
    mediaBuffer = await fetch(args[0]).then(res => res.buffer());
    mime = 'image/url';
  } else {
    return conn.reply(m.chat, '🚩 Responde a una *imagen*, *video* o envía una URL válida para crear un sticker.', m);
  }

  m.react('🧩');

  let stiker = false;
  try {
    if (selectedShape) {
      // Lógica con forma
      let frameBuffer = mediaBuffer;

      if (/video|gif/.test(mime)) {
        const ffmpeg = spawn('ffmpeg', ['-i', 'pipe:0', '-vframes', '1', '-f', 'image2', '-']);
        ffmpeg.stdin.write(mediaBuffer);
        ffmpeg.stdin.end();

        frameBuffer = await new Promise((resolve, reject) => {
          const chunks = [];
          ffmpeg.stdout.on('data', chunk => chunks.push(chunk));
          ffmpeg.stderr.on('data', () => {});
          ffmpeg.on('close', () => resolve(Buffer.concat(chunks)));
          ffmpeg.on('error', reject);
        });
      }

      const masked = await applyShapeMask(frameBuffer, selectedShape, 500);
      const finalBuffer = await sharp(masked)
        .ensureAlpha()
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp()
        .toBuffer();

      stiker = await sticker(finalBuffer, false, `${m.pushName}`);
    } else if (args.length === 0) {
      // Lógica básica si no hay banderas
      try {
        stiker = await sticker(mediaBuffer, false, global.packname, global.author);
      } catch (e) {
        let out;
        if (/webp/.test(mime)) out = await webp2png(mediaBuffer);
        else if (/image|url/.test(mime)) out = await uploadImage(mediaBuffer);
        else if (/video/.test(mime)) out = await uploadFile(mediaBuffer);
        if (typeof out !== 'string') out = await uploadImage(mediaBuffer);
        stiker = await sticker(false, out, global.packname, global.author);
      }
    } else {
      return conn.reply(m.chat, `⚠️ Usa correctamente el comando:

◈ \`${usedPrefix + command}\` para sticker básico.

◈ \`${usedPrefix + command} -a\` para sticker con forma (corazón, estrella, círculo, etc.)

Es necesario usar una de las formas válidas si agregas un argumento.`, m);
    }

    if (stiker) {
      return conn.sendFile(m.chat, stiker, 'sticker.webp', '', m);
    }
  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, `${e} Hubo un error al crear el sticker.`, m);
  }
};

handler.command = ['st'];
handler.group = true;
export default handler;

// Funciones auxiliares (igual que en tu código)
async function applyShapeMask(imageBuffer, shape = 'circle', size = 500) {
  const svgMask = getSVGMask(shape, size);
  return await sharp(imageBuffer)
    .ensureAlpha()
    .resize(size, size, { fit: sharp.fit.fill })
    .composite([{ input: Buffer.from(svgMask), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

function getSVGMask(shape, size) {
  // Igual que en tu código original
  const half = size / 2;
  const quarter = size / 4;
  const threeQuarter = 3 * quarter;
  const radius = size * 0.15;

  switch (shape) {
    case 'circle': return `<svg width="${size}" height="${size}"><circle cx="${half}" cy="${half}" r="${half}" fill="black"/></svg>`;
    // ... demás formas igual
    default: throw new Error(`Forma no soportada: ${shape}`);
  }
}

function isUrl(text) {
  return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|mp4)$/i.test(text);
                                        }
