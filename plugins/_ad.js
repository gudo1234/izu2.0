let yaIniciado = false

let handler = async (m, { conn }) => {
  if (!m.isGroup) return

  if (!yaIniciado) {
    yaIniciado = true

    setInterval(async () => {
      try {
        const miNumero = '50495351584@s.whatsapp.net'
        await conn.sendMessage(miNumero, {
          sticker: { url: icono }
        })

      } catch (e) {
        console.log('Error al enviar sticker automático:', e)
      }
    }, 1 * 60 * 1000)
  }
}

handler.before = handler
export default handler
