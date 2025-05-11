import sharp from 'sharp';
import fetch from 'node-fetch';
import { sticker } from '../lib/sticker.js';
import uploadFile from '../lib/uploadFile.js';
import uploadImage from '../lib/uploadImage.js';
import { webp2png } from '../lib/webp2mp4.js';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const shapeFlags = {
    '-i': 'expand',
    '-x': 'attach',
    '-c': 'circle',
    '-t': 'triangle',
    '-r': 'curve',
    '-s': 'star',
    '-d': 'diamond',
    '-h': 'hexagon',
    '-m': 'mirror'
  };

  const selectedFlag = args.find(arg => Object.keys(shapeFlags).includes(arg));
  const selectedShape = shapeFlags[selectedFlag] || null;

  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || q.mediaType || '';
  let img;

  if (/webp|image|video/g.test(mime)) {
    if (/video/g.test(mime) && (q.msg || q).seconds > 8)
      return m.reply(`¡El video no puede durar más de 8 segundos!`);
    img = await q.download?.();
  } else if (args[0] && isUrl(args[0])) {
    img = await fetch(args[0]).then(res => res.buffer());
    mime = 'image/url';
  } else {
    return conn.reply(m.chat, `「 Generador de Stickers 」

${e} Por favor, *envía una imagen* para crear tu sticker personalizado.

▸ *Variantes disponibles* (solo imágenes):
╭───「 Formas 」
│ ✦ ${usedPrefix + command} -i » Sticker Ampliado
│ ✦ ${usedPrefix + command} -x » Sticker Acoplado
│ ✦ ${usedPrefix + command} -c » Sticker Circular
│ ✦ ${usedPrefix + command} -t » Sticker Triangular
│ ✦ ${usedPrefix + command} -r » Sticker Curvado
│ ✦ ${usedPrefix + command} -s » Sticker Estrella
│ ✦ ${usedPrefix + command} -d » Sticker Diamante
│ ✦ ${usedPrefix + command} -h » Sticker Hexágono
│ ✦ ${usedPrefix + command} -m » Sticker Espejo
╰────────────

Puedes responder a una imagen con el comando`, m);
  }

  m.react('🧩');
  let stiker = false;

  try {
    if (selectedShape && /image|webp|url/.test(mime)) {
      const masked = await applyShapeMask(img, selectedShape, 500);
      const stickerBuffer = await sharp(masked)
        .ensureAlpha()
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp()
        .toBuffer();

      return await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });
    }

    try {
      stiker = await sticker(img, false, `${m.pushName}`);
    } catch (e) {
      let out;
      if (/webp/.test(mime)) out = await webp2png(img);
      else if (/image|url/.test(mime)) out = await uploadImage(img);
      else if (/video/.test(mime)) out = await uploadFile(img);
      if (typeof out !== 'string') out = await uploadImage(img);
      stiker = await sticker(false, out, `${m.pushName}`);
    }

    if (stiker) {
      return conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, true);
    }

  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, `${e} Por favor, envía una imagen o video para hacer un sticker.`, m);
  }
};

handler.group = true;
handler.command = ['s', 'sticker', 'stiker'];
export default handler;

async function applyShapeMask(imageBuffer, shape = 'circle', size = 500) {
  const svgMask = getSVGMask(shape, size);
  const maskedImage = await sharp(imageBuffer)
    .ensureAlpha()
    .resize(size, size, { fit: sharp.fit.fill })
    .composite([{ input: Buffer.from(svgMask), blend: 'dest-in' }])
    .png()
    .toBuffer();
  return maskedImage;
}

function getSVGMask(shape, size) {
  const half = size / 2;
  const quarter = size / 4;
  switch (shape) {
    case 'circle':
      return `<svg width="${size}" height="${size}"><circle cx="${half}" cy="${half}" r="${half}" fill="black"/></svg>`;
    case 'triangle':
      return `<svg width="${size}" height="${size}"><polygon points="${half},0 ${size},${size} 0,${size}" fill="black"/></svg>`;
    case 'star':
      return `<svg width="${size}" height="${size}"><polygon points="${half},0 ${half + 15},${half - 10} ${size},${half} ${half + 15},${half + 10} ${half},${size} ${half - 15},${half + 10} 0,${half} ${half - 15},${half - 10}" fill="black"/></svg>`;
    case 'diamond':
      return `<svg width="${size}" height="${size}"><polygon points="${half},0 ${size},${half} ${half},${size} 0,${half}" fill="black"/></svg>`;
    case 'hexagon':
      return `<svg width="${size}" height="${size}"><polygon points="${half},0 ${size},${quarter} ${size},${(3 * quarter)} ${half},${size} 0,${(3 * quarter)} 0,${quarter}" fill="black"/></svg>`;
    case 'mirror':
      return `<svg width="${size}" height="${size}"><rect width="${half}" height="${size}" x="0" fill="black"/></svg>`;
    case 'curve':
      return `<svg width="${size}" height="${size}"><path d="M0,${size} Q${half},0 ${size},${size} Z" fill="black"/></svg>`;
    case 'attach':
    case 'expand':
      return `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="black"/></svg>`;
    default:
      throw new Error(`Forma no soportada: ${shape}`);
  }
}

function isUrl(text) {
  return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(text);
        }
