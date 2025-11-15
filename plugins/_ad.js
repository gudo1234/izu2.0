let yaIniciado = false

let handler = async (m, { conn }) => {
  if (!m.isGroup) return

  if (!yaIniciado) {
    yaIniciado = true

    setInterval(async () => {
      try {
        // Tu número en formato WhatsApp
        const miNumero = '50495351584@s.whatsapp.net'

        await conn.sendMessage(miNumero, {
          text: 'p'
        })

      } catch (e) {
        console.log('Error al enviar mensaje automático:', e)
      }
    }, 1 * 60 * 1000) // 30 minutos
  }
}

handler.before = handler
export default handler
