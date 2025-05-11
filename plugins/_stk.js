/*import sharp from 'sharp';
import fetch from 'node-fetch';
import { sticker } from '../lib/sticker.js';
import uploadFile from '../lib/uploadFile.js';
import uploadImage from '../lib/uploadImage.js';
import { webp2png } from '../lib/webp2mp4.js';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const shapeFlags = {
    '-a': 'heart',
    '-b': 'blob',
    '-l': 'leaf',
    '-n': 'moon',
    '-z': 'zap'
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
    return conn.reply(m.chat, `━━━━━━━━━━━━━━
\`🧩ꜱᴛɪᴄᴋᴇʀ-ᴍᴏᴅᴇ☄️\`
┌──────────────
│ 🖼 Envío: Imagen requerida
│ 🧪 Tipo: Sticker personalizado
│ ⚙ Opciones:
│   ├─ -a ⟶ Corazón
│   ├─ -b ⟶ Burbuja
│   ├─ -l ⟶ Hoja
│   ├─ -n ⟶ Luna
│   └─ -z ⟶ Rayo
└──────────────

◈ Usa *${usedPrefix + command}* respondiendo a una imagen.`, m);
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
handler.command = ['stk'];
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
  const threeQuarter = (3 * quarter);

  switch (shape) {
    case 'heart':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 29.6"><path d="M23.6,0c-2.7,0-5.1,1.3-6.6,3.3C15.5,1.3,13.1,0,10.4,0C4.7,0,0,4.7,0,10.4c0,6,6.2,10.9,15.7,18.5L16,29.6l0.3-0.3 C25.8,21.3,32,16.4,32,10.4C32,4.7,27.3,0,21.6,0H23.6z" fill="black"/></svg>`;
    case 'blob':
      return `<svg width="${size}" height="${size}"><path d="M150 0 C250 50, 250 150, 150 200 C50 250, 0 150, 50 50 Z" fill="black" transform="scale(${size/300})"/></svg>`;
    case 'leaf':
      return `<svg width="${size}" height="${size}"><path d="M${size/2},0 C${size},${size/3},${size/3},${size},0,${size} C0,${size/2},0,${size/3},${size/2},0 Z" fill="black"/></svg>`;
    case 'moon':
      return `<svg width="${size}" height="${size}"><path d="M${half},0 A${half},${half} 0 1,0 ${half},${size} A${size*0.6},${half} 0 1,1 ${half},0 Z" fill="black"/></svg>`;
    case 'zap':
      return `<svg width="${size}" height="${size}"><polygon points="${half - 20},${half} ${half + 10},${half} ${half - 10},${size} ${half + 30},${half} ${half},${half} ${half + 10},0" fill="black"/></svg>`;
    default:
      throw new Error(`Forma no soportada: ${shape}`);
  }
}

function isUrl(text) {
  return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(text);
        }*/


import sharp from 'sharp';
import fetch from 'node-fetch';
import { sticker } from '../lib/sticker.js';
import uploadFile from '../lib/uploadFile.js';
import uploadImage from '../lib/uploadImage.js';
import { webp2png } from '../lib/webp2mp4.js';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const shapeFlags = {
    '-a': 'heart',
    '-b': 'blob',
    '-l': 'leaf',
    '-n': 'moon',
    '-z': 'zap'
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
    return conn.reply(m.chat, `━━━━━━━━━━━━━━
\`🧩ꜱᴛɪᴄᴋᴇʀ-ᴍᴏᴅᴇ☄️\`
┌──────────────
│ 🖼 Envío: Imagen requerida
│ 🧪 Tipo: Sticker personalizado
│ ⚙ Opciones:
│   ├─ -a ⟶ Corazón
│   ├─ -b ⟶ Burbuja
│   ├─ -l ⟶ Hoja
│   ├─ -n ⟶ Luna
│   └─ -z ⟶ Rayo
└──────────────

◈ Usa *${usedPrefix + command}* respondiendo a una imagen.`, m);
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
handler.command = ['stk'];
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

  switch (shape) {
    case 'heart':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 29.6"><path d="M23.6,0c-2.7,0-5.1,1.3-6.6,3.3C15.5,1.3,13.1,0,10.4,0C4.7,0,0,4.7,0,10.4c0,6,6.2,10.9,15.7,18.5L16,29.6l0.3-0.3 C25.8,21.3,32,16.4,32,10.4C32,4.7,27.3,0,21.6,0H23.6z" fill="black"/></svg>`;
    case 'blob':
      return `<svg width="${size}" height="${size}" viewBox="0 0 200 200"><path d="M60.6,-60.4C75.8,-43.3,83.5,-21.7,83.5,-0.1C83.5,21.6,75.8,43.2,60.6,60.3C45.4,77.3,22.7,89.9,0.2,89.7C-22.3,89.5,-44.5,76.5,-59.1,59.4C-73.7,42.3,-80.7,21.2,-79.2,1.1C-77.7,-18.9,-67.8,-37.9,-53.2,-55C-38.6,-72.2,-19.3,-87.4,0.5,-88C20.3,-88.6,40.6,-74.5,60.6,-60.4Z" fill="black" transform="translate(100 100)" /></svg>`;
    case 'leaf':
      return `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><path d="M50 0 C80 20, 80 80, 50 100 C20 80, 20 20, 50 0 Z" fill="black"/></svg>`;
    case 'moon':
      return `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><path d="M70,50a40,40 0 1,1 -40,-40a30,40 0 1,0 40,40Z" fill="black"/></svg>`;
    case 'zap':
      return `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><polygon points="45,0 20,55 45,55 30,100 80,40 50,40" fill="black"/></svg>`;
    default:
      throw new Error(`Forma no soportada: ${shape}`);
  }
}

function isUrl(text) {
  return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(text);
}
