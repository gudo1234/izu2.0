import { googleImage } from '@bochilteam/scraper'
import fetch from 'node-fetch'
import sharp from 'sharp'
import { sticker } from '../lib/sticker.js'

async function bufferToSticker(buffer, author = '') {
  // redimensiona manteniendo proporción dentro de 512x512 y convierte a WebP
  const webp = await sharp(buffer)
    .ensureAlpha()
    .resize({ width: 512, height: 512, fit: 'inside' })
    .webp({ lossless: true })
    .toBuffer()
  // empaqueta en formato sticker
  return sticker(webp, false, `${m.pushName}`)
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `${e} Proporciona una búsqueda para enviar stickers\n\n` +
      `*Ejemplo:* *${usedPrefix + command} gatos*`,
      m
    )
  }
m.react('🕒')
  // busca imágenes
  const res = await googleImage(text)
  const count = 9
  // obtenemos URLs aleatorias
  const urls = await Promise.all(Array.from({ length: count }).map(() => res.getRandom()))

  for (let url of urls) {
    try {
      const imgBuf = await fetch(url).then(r => r.buffer())
      const stkr = await bufferToSticker(imgBuf, m.pushName)
      await conn.sendFile(m.chat, stkr, 'sticker.webp', '', m, true)
    } catch (e) {
      console.error('Error creando sticker:', e)
    }
  }
}

handler.command = ['stickers','stikers']
handler.group = true

export default handler
