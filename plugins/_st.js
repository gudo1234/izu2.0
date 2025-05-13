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
  const selectedShape = shapeFlags[selectedFlag];

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
      // Lógica personalizada con forma SVG
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

      stiker = await sticker(finalBuffer, false, global.packname, global.author);
    } else if (args.length === 0) {
      // Lógica básica sin argumentos
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
      // Argumento inválido
      return conn.reply(m.chat, `⚠️ Argumento no válido.

Usa:
• \`${usedPrefix + command}\` para crear un sticker normal
• \`${usedPrefix + command} -a\` para crear un sticker con forma (corazón, círculo, estrella, etc.)

Formas válidas: ${Object.keys(shapeFlags).join(', ')}`, m);
    }

    if (stiker) {
      return conn.sendFile(m.chat, stiker, 'sticker.webp', '', m);
    }
  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, `❌ Error al crear el sticker:\n${e}`, m);
  }
};

handler.command = ['st'];
export default handler;

// Funciones auxiliares
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
  const half = size / 2;
  const quarter = size / 4;
  const threeQuarter = 3 * quarter;
  const radius = size * 0.15;

  switch (shape) {
    case 'circle': return `<svg width="${size}" height="${size}"><circle cx="${half}" cy="${half}" r="${half}" fill="black"/></svg>`;
    case 'triangle': return `<svg width="${size}" height="${size}"><polygon points="${half},0 ${size},${size} 0,${size}" fill="black"/></svg>`;
    case 'diamond': return `<svg width="${size}" height="${size}"><polygon points="${half},0 ${size},${half} ${half},${size} 0,${half}" fill="black"/></svg>`;
    case 'hexagon': return `<svg width="${size}" height="${size}"><polygon points="${quarter},0 ${threeQuarter},0 ${size},${half} ${threeQuarter},${size} ${quarter},${size} 0,${half}" fill="black"/></svg>`;
    case 'pentagon': return `<svg width="${size}" height="${size}"><polygon points="${half},0 ${size},${half} ${threeQuarter},${size} ${quarter},${size} 0,${half}" fill="black"/></svg>`;
    case 'heart': return `<svg width="${size}" height="${size}"><path d="M ${half},${size} C ${half * 1.5},${threeQuarter} ${size},${quarter} ${half},${quarter} C 0,${quarter} ${half * 0.5},${threeQuarter} ${half},${size} Z" fill="black"/></svg>`;
    case 'blob': return `<svg width="${size}" height="${size}"><path d="M ${half},0 C ${size},0 ${size},${size} ${half},${size} C 0,${size} 0,0 ${half},0 Z" fill="black"/></svg>`;
    case 'leaf': return `<svg width="${size}" height="${size}"><path d="M ${half},0 C ${size},${quarter} ${threeQuarter},${size} ${half},${size} C ${quarter},${size} 0,${quarter} ${half},0 Z" fill="black"/></svg>`;
    case 'moon': return `<svg width="${size}" height="${size}"><path d="M ${half},0 A ${half},${half} 0 1,0 ${half},${size} A ${quarter},${half} 0 1,1 ${half},0 Z" fill="black"/></svg>`;
    case 'star': return `<svg width="${size}" height="${size}"><polygon points="${half},0 ${threeQuarter},${threeQuarter} 0,${quarter} ${size},${quarter} ${quarter},${threeQuarter}" fill="black"/></svg>`;
    case 'zap': return `<svg width="${size}" height="${size}"><polygon points="${quarter},0 ${threeQuarter},${half} ${half},${half} ${threeQuarter},${size} ${quarter},${half} ${half},${half}" fill="black"/></svg>`;
    case 'curve': return `<svg width="${size}" height="${size}"><path d="M0,${size} Q${half},${half} ${size},${size} V0 H0 Z" fill="black"/></svg>`;
    case 'edges': return `<svg width="${size}" height="${size}"><path d="M0,0 L${size},${half} L0,${size} Z" fill="black"/></svg>`;
    case 'mirror': return `<svg width="${size}" height="${size}"><path d="M0,0 L${half},${size} L${size},0 Z" fill="black"/></svg>`;
    case 'arrow': return `<svg width="${size}" height="${size}"><path d="M${half},0 L${size},${half} L${half},${size} L${half},${threeQuarter} L0,${threeQuarter} L0,${quarter} L${half},${quarter} Z" fill="black"/></svg>`;
    case 'attach': return `<svg width="${size}" height="${size}"><circle cx="${half}" cy="${half}" r="${half}" fill="black"/><rect x="${quarter}" y="${quarter}" width="${half}" height="${half}" fill="white"/></svg>`;
    case 'expand': return `<svg width="${size}" height="${size}"><polygon points="0,0 ${quarter},0 ${quarter},${quarter} 0,${quarter}" fill="black"/><polygon points="${threeQuarter},0 ${size},0 ${size},${quarter} ${threeQuarter},${quarter}" fill="black"/><polygon points="0,${threeQuarter} ${quarter},${threeQuarter} ${quarter},${size} 0,${size}" fill="black"/><polygon points="${threeQuarter},${threeQuarter} ${size},${threeQuarter} ${size},${size} ${threeQuarter},${size}" fill="black"/></svg>`;
    default: throw new Error(`Forma no soportada: ${shape}`);
  }
}

function isUrl(text) {
  return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|mp4)$/i.test(text);
}
