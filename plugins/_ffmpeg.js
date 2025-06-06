import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import { fileURLToPath } from 'url'

const OWNER_JID = '50492280729@s.whatsapp.net'

let handler = async (m, { conn }) => {
  const __filename = fileURLToPath(import.meta.url)
  const scriptName = path.basename(__filename)

  const inputPath = '/mnt/data/input.mp4' // aquí define o pasa el archivo real
  const outputPath = '/mnt/data/output.mp4'

  try {
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run()
    })
  } catch (e) {
    const errorMsg = `
❌ *FFmpeg Error*
📁 *Script:* ${scriptName}
🎬 *Video de entrada:* ${path.basename(inputPath)}
📄 *Mensaje:* ${e.message}
🔍 *Causa:* ${e.stack?.split('\n')[0] || 'No disponible'}
    `.trim()

    console.error(errorMsg)

    // Aviso en grupo
    await conn.reply(m.chat, `❌ Error procesando *${path.basename(inputPath)}* con ffmpeg. Ya fue notificado al owner.`, m)

    // Aviso privado al OWNER
    await conn.reply(OWNER_JID, errorMsg, null, {
      contextInfo: { mentionedJid: [m.sender] }
    })
  }
}

handler.command = ['ffmpeg'] // o el comando que uses
export default handler
