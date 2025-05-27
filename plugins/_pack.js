import fetch from 'node-fetch'
import googleImage from '@bochilteam/scraper'
import { sticker } from '../lib/sticker.js'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Ejemplo: ${usedPrefix + command} gatos`
  m.reply(`Buscando imágenes sobre: *${text}*...`)
  
  try {
    const res = await googleImage(text)
    const results = res.getRandom().slice(0, 5) // puedes cambiar el número de stickers
    m.reply(`Enviando paquete de stickers de *"${text}"*...`)

    for (let i = 0; i < results.length; i++) {
      const img = await (await fetch(results[i])).buffer()
      const stickerBuffer = await sticker(img, false, {
        packname: `IzuBot`,
        author: `by @follen.dev`
      })

      if (stickerBuffer) {
        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
      }
    }
  } catch (e) {
    console.error(e)
    throw 'Ocurrió un error al generar el paquete de stickers.'
  }
}

handler.command = ['packstickers', 'pack']
handler.group = true;
export default handler;
