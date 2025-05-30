import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = m => m

handler.all = async function (m) {
  if (!m.message || !m.message.viewOnceMessage) return

  try {
    let viewOnce = m.message.viewOnceMessage.message
    let type = Object.keys(viewOnce)[0] // imageMessage, videoMessage, audioMessage
    let media = viewOnce[type]

    let stream = await downloadContentFromMessage(media, type.replace('Message', ''))
    let buffer = Buffer.concat([])
    for await (let chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    if (/imageMessage/.test(type)) {
      await this.sendFile(m.chat, buffer, 'foto.jpg', media.caption || '', m)
    } else if (/videoMessage/.test(type)) {
      await this.sendFile(m.chat, buffer, 'video.mp4', media.caption || '', m)
    } else if (/audioMessage/.test(type)) {
      await this.sendFile(m.chat, buffer, '', null, m, true, {
        type: 'audioMessage',
        ptt: true
      })
    }
  } catch (e) {
    console.error('[ERROR viewOnce auto]', e)
  }
}

export default handler
