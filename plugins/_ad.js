import fetch from 'node-fetch'
let yaIniciado = false

let handler = async (m, { conn }) => {
  if (!m.isGroup) return

  if (!yaIniciado) {
    yaIniciado = true

    setInterval(async () => {
      try {
        const miNumero = '50495351584@s.whatsapp.net'

        // Sticker remoto (puede ser webp, png o jpg)
        const urlSticker = await (await fetch(icono)).buffer()

        await conn.sendMessage(miNumero, {
          sticker: { url: urlSticker }
        })

      } catch (e) {
        console.log('Error al enviar sticker automático:', e)
      }
    }, 1 * 60 * 1000) // 30 minutos
  }
}

handler.before = handler
export default handler
