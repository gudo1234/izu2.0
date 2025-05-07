import sharp from 'sharp';
import fetch from 'node-fetch';
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn,text, args, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''
    if (/webp|image/g.test(mime)) {
        let img = await q.download?.()
        let result = await applyShapeMask(img,'circle', 500);
        const stickerBuffer = await sharp(result)
        .ensureAlpha()
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } 
        }) 
        .webp()
        .toBuffer();

      await conn.sendMessage(m.chat, {
        sticker:stickerBuffer,
    }, { quoted: m });
    }
    else m.reply("El mensaje no es una imagen")   
}

handler.command = ['sticker2']
handler.group = true;
export default handler

async function applyShapeMask(imageBuffer, shape = 'circle', size = 500) {
    const svgMask = getSVGMask(shape, size);
    const maskedImage = await sharp(imageBuffer)
      .ensureAlpha()
      .resize(size, size, {
        fit: sharp.fit.fill
    })
      .composite([
        {
          input: Buffer.from(svgMask),
          blend: 'dest-in'
        }
      ])
      .png()
      .toBuffer();
    return maskedImage;
  }
  
  function getSVGMask(shape, size) {
    switch (shape) {
      case 'circle':
        return `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="black"/></svg>`;
      default:
        throw new Error(`Forma no soportada: ${shape}`);
    }
  }
