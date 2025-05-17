import sharp from 'sharp';
import fetch from 'node-fetch';
import { spawn } from 'child_process';
import { sticker } from '../lib/sticker.js';
import uploadFile from '../lib/uploadFile.js';
import uploadImage from '../lib/uploadImage.js';
import { webp2png } from '../lib/webp2mp4.js';
import fs from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { randomUUID } from 'crypto';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const shapeFlags = {
    '-c': 'circle', '-t': 'triangle', '-d': 'diamond', '-h': 'hexagon', '-p': 'pentagon',
    '-a': 'heart', '-b': 'blob', '-l': 'leaf', '-n': 'moon', '-s': 'star', '-z': 'zap',
    '-r': 'curve', '-e': 'edges', '-m': 'mirror', '-f': 'arrow', '-x': 'attach', '-i': 'expand'
  };
  const thumbnail = await (await fetch(icono)).buffer();
  const selectedFlag = args.find(arg => Object.keys(shapeFlags).includes(arg));
  const selectedShape = shapeFlags[selectedFlag] || null;

  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || q.mediaType || '';
  let img;

  if (/webp|image|video|gif/g.test(mime)) {
    if (/video/g.test(mime) && (q.msg || q).seconds > 8)
      return m.reply('¡El video no puede durar más de 8 segundos!');
    img = await q.download?.();
  } else if (args[0] && isUrl(args[0])) {
    img = await fetch(args[0]).then(res => res.buffer());
    mime = 'image/url';
  } else {
    return conn.reply(m.chat, `Responde a una *imagen, video o GIF* para crear un sticker. También puedes agregar una forma personalizada con una opción.

┌🎨 \`Formas disponibles:\`
│
│ ● *Básicas*
│ ├─ -c → Circular
│ ├─ -t → Triangular
│ ├─ -d → Diamante
│ ├─ -h → Hexágono
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
│ └─ -i → Ampliado
└──────────

◈ *Ejemplo:* responde a una imagen con: \`${usedPrefix + command} -a\``, m);
  }

  m.react('🧩');
  let stiker = false;

  try {
    if (selectedShape && /image|webp|url|video|gif/.test(mime)) {
      // Lógica con forma SVG (igual que antes)
      let frameBuffer = img;
      if (/video|mp4|gif/.test(mime)) {
        const tempInputPath = path.join(tmpdir(), `${randomUUID()}.mp4`);
        const tempOutputPath = path.join(tmpdir(), `${randomUUID()}.png`);
        await fs.writeFile(tempInputPath, img);
        await new Promise((resolve, reject) => {
          const ffmpeg = spawn('ffmpeg', ['-y','-i', tempInputPath, '-vf','scale=500:-1','-vframes','1', tempOutputPath]);
          ffmpeg.on('close', resolve);
          ffmpeg.on('error', reject);
        });
        frameBuffer = await fs.readFile(tempOutputPath);
        await fs.unlink(tempInputPath).catch(()=>{});
        await fs.unlink(tempOutputPath).catch(()=>{});
      }
      const masked = await applyShapeMask(frameBuffer, selectedShape, 500);
      const finalBuffer = await sharp(masked)
        .ensureAlpha()
        .resize(512, 512, { fit: 'contain', background: { r:0, g:0, b:0, alpha:0 } })
        .webp()
        .toBuffer();
      stiker = await sticker(finalBuffer, false, `${m.pushName}`);
    } else {
      // Sin forma: mantenemos proporción y evitamos bordes
      const bufferOptimizado = await sharp(img)
        .resize(512, 512, { fit: 'inside' })
        .webp()
        .toBuffer();
      stiker = await sticker(bufferOptimizado, false, `${m.pushName}`);
    }

    if (stiker) {
      return conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, true, {
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
    return conn.reply(m.chat, `Error: ${e}. Por favor, envía una imagen o video válido.`, m);
  }
};

handler.group = true;
handler.command = ['st'];
export default handler;

// Funciones auxiliares (sin cambios)
async function applyShapeMask(imageBuffer, shape = 'circle', size = 500) {
  const svgMask = getSVGMask(shape, size);
  return sharp(imageBuffer)
    .ensureAlpha()
    .resize(size, size, { fit: sharp.fit.fill })
    .composite([{ input: Buffer.from(svgMask), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

function getSVGMask(shape, size) {
  const half = size / 2;
  const quarter = size / 4;
  const threeQuarter = 3 * quarter;
  const radius = size * 0.15;
  switch (shape) {
    case 'circle': return `<svg width="${size}" height="${size}"><circle cx="${half}" cy="${half}" r="${half}" fill="black"/></svg>`;
    // ... (resto de máscaras igual que antes)
    default: throw new Error(`Forma no soportada: ${shape}`);
  }
}

function isUrl(text) {
  return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|mp4)$/i.test(text);
}
