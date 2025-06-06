import ffmpeg from 'fluent-ffmpeg'

const OWNER_JID = '50492280729@s.whatsapp.net'

let handler = async (m, { conn }) => {
  try {
    await new Promise((resolve, reject) => {
      ffmpeg('input.mp4') // Cambia esto al archivo real de entrada
        .output('output.mp4') // Cambia esto al archivo de salida deseado
        .on('end', resolve)
        .on('error', reject)
        .run()
    })
  } catch (e) {
    const errorMsg = `❌ Error al procesar con ffmpeg:\n${e.message}`
    console.error(errorMsg)

    await conn.reply(m.chat, errorMsg, m)
    await conn.reply(OWNER_JID, errorMsg, null, {
      contextInfo: { mentionedJid: [m.sender] }
    })
  }
}

handler.command = ['ffmpeg'] // puedes cambiar el nombre del comando

export default handler
