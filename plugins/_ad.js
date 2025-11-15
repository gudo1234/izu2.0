import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

let yaIniciado = false

let handler = async (m, { conn }) => {
  if (!m.isGroup) return

  if (!yaIniciado) {
    yaIniciado = true

    setInterval(async () => {
      try {
        await conn.sendMessage(
          '50495351584@s.whatsapp.net',
          { sticker: await sticker(await (await fetch(icono)).buffer(), wm, m.pushName) }
        )
      } catch (e) {
        console.log('Error en sticker automático:', e)
      }
    }, 1 * 60 * 1000) // 30 min
  }
}

handler.before = handler
export default handler
