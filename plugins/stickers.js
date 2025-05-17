import { googleImage } from '@bochilteam/scraper'
import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `${e} Proporciona una búsqueda para enviar stickers de la web\n\n` +
      `*Ejemplo:* ${usedPrefix + command} gatos`,
      m
    )
  }
  m.react('🕒')

  // Busca imágenes
  const res = await googleImage(text)
  const count = 9
  const promises = Array.from({ length: count }).map(() => res.getRandom())
  const links = await Promise.all(promises)

  for (let i = 0; i < links.length; i++) {
    try {
      const url = links[i]
      const imgBuffer = await fetch(url).then(r => r.buffer())
      const webpBuffer = await sticker(imgBuffer, false, m.pushName)

      // Enviar como sticker
      await conn.sendMessage(
        m.chat,
        { sticker: webpBuffer },
        { quoted: m }
      )
    } catch (err) {
      console.error(`Error al procesar sticker ${i + 1}:`, err)
    }
  }
}

handler.command = ['stickers', 'stikers']
handler.group = true

export default handler
