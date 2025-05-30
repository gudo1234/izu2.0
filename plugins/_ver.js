import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = m => m

handler.all = async function (m) {
  try {
    // Verifica si el mensaje es de visualización única
    let vmsg = m.message?.viewOnceMessage?.message
    if (!vmsg) return

    // Obtiene el tipo: imageMessage, videoMessage, audioMessage
    let type = Object.keys(vmsg)[0]
    let media = vmsg[type]

    // Descarga el contenido
    const stream = await downloadContentFromMessage(media, type.replace('Message', ''))
    let buffer = Buffer.concat([])
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    // Reenvía según el tipo
    if (type === 'imageMessage') {
      await this.sendFile(m.chat, buffer, 'foto.jpg', media.caption || '', m)
    } else if (type === 'videoMessage') {
      await this.sendFile(m.chat, buffer, 'video.mp4', media.caption || '', m)
    } else if (type === 'audioMessage') {
      await this.sendFile(m.chat, buffer, '', null, m, true, {
        type: 'audioMessage',
        ptt: true
      })
    }
  } catch (e) {
    console.error('[❌ ERROR auto-viewOnce]', e)
  }
}

export default handler
