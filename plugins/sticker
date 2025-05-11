import sharp from 'sharp';
import fetch from 'node-fetch';
import { sticker } from '../lib/sticker.js';
import uploadFile from '../lib/uploadFile.js';
import uploadImage from '../lib/uploadImage.js';
import { webp2png } from '../lib/webp2mp4.js';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const isCircle = args.includes('-c');
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
    return conn.reply(m.chat, `${e} Menciona una *imagen/video/gif* junto al comando: ${command} para convertirlo en un sticker.

Variantes para crear stickers, *solo disponible para imágenes* 🧩

> Sticker Circular
⚡ *Comando* : ${usedPrefix + command} -c`, m);
  }

  m.react('🧩');
  let stiker = false;

  try {
    if (isCircle && /image|webp|url/.test(mime)) {
      const masked = await applyShapeMask(img, 'circle', 500);
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
      return conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, true, rcanal);
    }

  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, `${e} Por favor, envia una imagen o video para hacer un sticker.`, m, rcanal);
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
  if (shape === 'circle') {
    return `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="black"/></svg>`;
  }
  throw new Error(`Forma no soportada: ${shape}`);
}

function isUrl(text) {
  return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(text);
        }
