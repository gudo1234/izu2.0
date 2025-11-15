import fetch from 'node-fetch'
import { addExif } from '../lib/sticker.js'

let yaIniciado = false

let handler = async (m, { conn }) => {
  if (!m.isGroup) return

  if (!yaIniciado) {
    yaIniciado = true

    setInterval(async () => {
      try {
        const miNumero = '50495351584@s.whatsapp.net'

        // Imagen base para crear el sticker
        const urlBase = icono
        const imagen = await (await fetch(urlBase)).buffer()

        // Textos del exif (pack + author)
        const texto1 = 'xd'
        const texto2 = ':v'

        // Generar sticker con tu librería
        const stickerFinal = await addExif(imagen, texto1, texto2)

        // Enviar el sticker
        await conn.sendMessage(miNumero, {
          sticker: stickerFinal
        })

      } catch (error) {
        console.log('Error en sticker automático:', error)
      }
    }, 1 * 60 * 1000) // 30 minutos
  }
}

handler.before = handler
export default handler
