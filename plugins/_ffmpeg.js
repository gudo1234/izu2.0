import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import { fileURLToPath } from 'url'

const OWNER_JID = '50492280729@s.whatsapp.net'

let handler = async (m, { conn }) => {
  const __filename = fileURLToPath(import.meta.url)
  const scriptName = path.basename(__filename)

  try {
    await new Promise((resolve, reject) => {
      ffmpeg('/mnt/data/input.mp4') // Asegúrate que el archivo exista
        .output('/mnt/data/output.mp4')
        .on('end', resolve)
        .on('error', reject)
        .run()
    })
  } catch (e) {
    const errorMsg = `
❌ *FFmpeg Error en ${scriptName}:*
*Mensaje:* ${e.message}
*Stack:* ${e.stack?.split('\n')[0] || 'No disponible'}
    `.trim()

    console.error(errorMsg)

    // Mensaje al usuario en el grupo/chat actual
    await conn.reply(m.chat, '❌ Hubo un problema procesando el video con ffmpeg.', m)

    // Mensaje directo al owner con detalles
    await conn.reply(OWNER_JID, errorMsg, null, {
      contextInfo: { mentionedJid: [m.sender] }
    })
  }
}

handler.command = ['ffmpeg'] // o el comando que uses
export default handler
