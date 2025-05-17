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
m.reply('🕒')
  // Busca imágenes
  const res = await googleImage(text)
  // Vamos a enviar 9 stickers (3x3)
  const count = 9
  const promises = Array.from({ length: count }).map(() => res.getRandom())

  // Descarga todos los enlaces
  const links = await Promise.all(promises)

  // Para cada enlace, fetch + convertir a sticker y enviar
  for (let i = 0; i < links.length; i++) {
    try {
      const url = links[i]
      const buffer = await fetch(url).then((r) => r.buffer())
      // convertir a webp/lossless y empaquetar
      const webpBuffer = await sticker(buffer, false, m.pushName)
      await conn.sendFile(
        m.chat,
        webpBuffer,
        'sticker.webp',
        '',
        m,
        true
      )
    } catch (err) {
      console.error(`Error al procesar sticker ${i + 1}:`, err)
    }
  }
}

handler.command = ['stickers', 'stikers']
handler.group = true

export default handler
