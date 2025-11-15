import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

let yaIniciado = false

let handler = async (m, { conn }) => {
  if (!m.isGroup) return

  if (!yaIniciado) {
    yaIniciado = true

    setInterval(async () => {
      try {
        const miNumero = '50495351584@s.whatsapp.net'
        const stickerBuffer = await (await fetch(icono)).buffer()
        const stikerFinal = await sticker(stickerBuffer, { packname: 'hola', author: '' })

        await conn.sendMessage(miNumero, { sticker: stikerFinal })

      } catch (e) {
        console.log('Error al enviar sticker automático:', e)
      }
    }, 1 * 60 * 1000) // 30 minutos
  }
}

handler.before = handler
export default handler
