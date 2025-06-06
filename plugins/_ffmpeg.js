import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import { fileURLToPath } from 'url'

const OWNER_JID = '50492280729@s.whatsapp.net'

let handler = async (m, { conn }) => {
  try {
    await new Promise((resolve, reject) => {
      ffmpeg('input.mp4') // Cambia esto por el input real
        .output('output.mp4') // Cambia esto por el output deseado
        .on('end', resolve)
        .on('error', reject)
        .run()
    })
  } catch (e) {
    const __filename = fileURLToPath(import.meta.url)
    const scriptName = path.basename(__filename)

    const errorMsg = `❌ Error en ${scriptName} al procesar con ffmpeg:\n${e.message}`

    console.error(errorMsg)

    // Responder en el grupo o chat donde ocurrió
    await conn.reply(m.chat, errorMsg, m)

    // Enviar en privado al OWNER
    await conn.reply(OWNER_JID, errorMsg, null, {
      contextInfo: { mentionedJid: [m.sender] }
    })
  }
}

handler.command = ['ffmpeg'] // Comando de prueba, puedes cambiarlo

export default handler
