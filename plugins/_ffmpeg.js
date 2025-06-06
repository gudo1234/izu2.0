import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const OWNER_JID = '50492280729@s.whatsapp.net'

let handler = async (m, { conn }) => {
  if (!m.quoted || !/video/.test(m.quoted.mimetype)) {
    return conn.reply(m.chat, '❌ Responde a un video para procesarlo.', m)
  }

  const __filename = fileURLToPath(import.meta.url)
  const scriptName = path.basename(__filename)

  const buffer = await m.quoted.download()
  const inputPath = join(tmpdir(), `${Date.now()}_input.mp4`)
  const outputPath = join(tmpdir(), `${Date.now()}_output.mp4`)

  writeFileSync(inputPath, buffer)

  try {
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run()
    })

    await conn.sendFile(m.chat, outputPath, 'output.mp4', '✅ Conversión exitosa.', m)
  } catch (e) {
    const errorMsg = `
❌ *FFmpeg Error*
📁 *Script:* ${scriptName}
🎬 *Video de entrada:* ${path.basename(inputPath)}
📄 *Mensaje:* ${e.message}
    `.trim()

    console.error(errorMsg)

    await conn.reply(m.chat, `${errorMsg}\n\n❌ Error procesando *${path.basename(inputPath)}* con ffmpeg. Ya fue notificado al owner.`, m)
    await conn.reply(OWNER_JID, errorMsg, null, {
      contextInfo: { mentionedJid: [m.sender] }
    })
  }
}

handler.command = ['ffmpeg']
export default handler
