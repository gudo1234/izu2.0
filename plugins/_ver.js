let handler = m => m

handler.all = async function (m, { conn }) {
  let msg = m.msg || m

  // Solo continuar si es viewOnce y contiene un mensaje multimedia
  if (!msg || !msg.message || !msg.message.viewOnceMessageV2) return

  try {
    let viewOnce = msg.message.viewOnceMessageV2.message
    let type = Object.keys(viewOnce || {})[0]
    let media = viewOnce[type]
    if (!media) return

    let stream = await downloadContentFromMessage(media, type.replace('Message', ''))
    let buffer = Buffer.from([])
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    if (/imageMessage/.test(type)) {
      await this.sendFile(m.chat, buffer, 'image.jpg', media.caption || '', m)
    } else if (/videoMessage/.test(type)) {
      await this.sendFile(m.chat, buffer, 'video.mp4', media.caption || '', m)
    } else if (/audioMessage/.test(type)) {
      await this.sendFile(m.chat, buffer, 'audio.mp3', null, m, true, {
        type: 'audioMessage',
        ptt: true
      })
    }
  } catch (e) {
    console.error('[ERROR viewOnce auto]', e)
  }

  return !0
}

export default handler

import { downloadContentFromMessage } from '@whiskeysockets/baileys'
