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

  // Descargar media (imagen/video/GIF) o URL
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
    return conn.reply(m.chat, `${e} Responde a una *imagen, video o GIF* para crear un sticker. También puedes agregar una forma personalizada con una opción.

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

  try {
    if (selectedShape && /image|webp|url|video|gif/.test(mime)) {
      // ==== LÓGICA CON MÁSCARA SVG ====
      let frameBuffer = img;
      if (/video|mp4|gif/.test(mime)) {
        const inPath = path.join(tmpdir(), `${randomUUID()}.mp4`);
        const outPath = path.join(tmpdir(), `${randomUUID()}.png`);
        await fs.writeFile(inPath, img);
        await new Promise((res, rej) => {
          const ff = spawn('ffmpeg', ['-y','-i', inPath, '-vf','scale=500:-1','-vframes','1', outPath]);
          ff.on('close', res);
          ff.on('error', rej);
        });
        frameBuffer = await fs.readFile(outPath);
        await fs.unlink(inPath).catch(()=>{});
        await fs.unlink(outPath).catch(()=>{});
      }
      // Aplicar máscara y generar WebP 512×512
      const masked = await applyShapeMask(frameBuffer, selectedShape, 500);
      const buf = await sharp(masked)
        .ensureAlpha()
        .resize(512, 512, { fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } })
        .webp()
        .toBuffer();
      const stkr = await sticker(buf, false, m.pushName);
      return conn.sendFile(m.chat, stkr, 'sticker.webp', '', m, true, {
        contextInfo: {
          forwardingScore: 200,
          isForwarded: false,
          externalAdReply: {
            showAdAttribution: false,
            title: m.pushName,
            body: textbot,
            mediaType: 1,
            sourceUrl: redes,
            thumbnail,
            thumbnailUrl: redes
          }
        }
      });

    } else {
      // ==== SIN FORMA: envío la media original ====
      let ext = 'jpg';
      if (/png/.test(mime)) ext = 'png';
      else if (/gif/.test(mime)) ext = 'gif';
      else if (/webp/.test(mime)) ext = 'webp';
      return conn.sendFile(m.chat, img, `image.${ext}`, '', m);
    }
  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, `Error: ${e.message}`, m);
  }
};

handler.group = true;
handler.command = ['st'];
export default handler;

// ———————————————
// FUNCIONES AUXILIARES
// ———————————————

async function applyShapeMask(imageBuffer, shape = 'circle', size = 500) {
  const svg = getSVGMask(shape, size);
  return sharp(imageBuffer)
    .ensureAlpha()
    .resize(size, size, { fit: sharp.fit.fill })
    .composite([{ input: Buffer.from(svg), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

function getSVGMask(shape, size) {
  const half = size/2;
  const q = size/4, tq = 3*q, r = size*0.15;
  switch (shape) {
    case 'circle':
      return `<svg width="${size}" height="${size}"><circle cx="${half}" cy="${half}" r="${half}" fill="black"/></svg>`;
    case 'triangle':
      return `<svg width="${size}" height="${size}"><polygon points="${half},0 ${size},${size} 0,${size}" fill="black"/></svg>`;
    case 'diamond':
      return `<svg width="${size}" height="${size}"><polygon points="${half},0 ${size},${half} ${half},${size} 0,${half}" fill="black"/></svg>`;
    case 'hexagon':
      return `<svg width="${size}" height="${size}"><polygon points="${half},0 ${size},${q} ${size},${tq} ${half},${size} 0,${tq} 0,${q}" fill="black"/></svg>`;
    case 'pentagon':
      return `<svg width="${size}" height="${size}"><polygon points="${half},0 ${size},${q} ${3*q},${size} ${q},${size} 0,${q}" fill="black"/></svg>`;
    case 'heart':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 29.6"><path d="M23.6,0c-2.7,0-5.1,1.3-6.6,3.3C15.5,1.3,13.1,0,10.4,0C4.7,0,0,4.7,0,10.4c0,6,6.2,10.9,15.7,18.5L16,29.6l0.3-0.3C25.8,21.3,32,16.4,32,10.4C32,4.7,27.3,0,21.6,0H23.6z" fill="black"/></svg>`;
    case 'blob':
      return `<svg width="${size}" height="${size}"><path d="M150 0 C250 50,250 150,150 200 C50 250,0 150,50 50 Z" fill="black" transform="scale(${size/300})"/></svg>`;
    case 'leaf':
      return `<svg width="${size}" height="${size}"><path d="M${half},0 C${size},${q},${q},${size} 0,${size} C0,${half} 0,${q} ${half},0 Z" fill="black"/></svg>`;
    case 'moon':
      return `<svg width="${size}" height="${size}"><path d="M${half},0 A${half},${half} 0 1,0 ${half},${size} A${size*0.6},${half} 0 1,1 ${half},0 Z" fill="black"/></svg>`;
    case 'star':
      return `<svg width="${size}" height="${size}"><polygon points="${half},0 ${half+15},${half-10} ${size},${half} ${half+15},${half+10} ${half},${size} ${half-15},${half+10} 0,${half} ${half-15},${half-10}" fill="black"/></svg>`;
    case 'zap':
      return `<svg width="${size}" height="${size}"><polygon points="${half-20},${half} ${half+10},${half} ${half-10},${size} ${half+30},${half} ${half},${half} ${half+10},0" fill="black"/></svg>`;
    case 'curve':
      return `<svg width="${size}" height="${size}"><path d="M0,${size} Q${half},0 ${size},${size} Z" fill="black"/></svg>`;
    case 'edges':
      return `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="black"/></svg>`;
    case 'mirror':
      return `<svg width="${size}" height="${size}"><rect width="${half}" height="${size}" x="0" fill="black"/></svg>`;
    case 'arrow':
      return `<svg width="${size}" height="${size}"><polygon points="0,${half-50} ${half},${half-50} ${half},0 ${size},${half} ${half},${size} ${half},${half+50} 0,${half+50}" fill="black"/></svg>`;
    case 'attach':
    case 'expand':
      return `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="black"/></svg>`;
    default:
      throw new Error(`Forma no soportada: ${shape}`);
  }
}

function isUrl(text) {
  return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|mp4)$/i.test(text);
}
