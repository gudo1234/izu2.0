let handler = m => m

handler.all = async function (m, { conn }) {
  try {
    let msg = m.msg || m

    // Detecta mensaje ViewOnce (ambos posibles)
    let viewOnceMsg = msg?.message?.viewOnceMessage?.message || msg?.message?.viewOnceMessageV2?.message
    if (!viewOnceMsg) return

    let type = Object.keys(viewOnceMsg)[0]
    let media = viewOnceMsg[type]
    if (!media) return

    const stream = await downloadContentFromMessage(media, type.replace('Message', ''))
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    if (type === 'imageMessage') {
      await this.sendFile(m.chat, buffer, 'foto.jpg', media.caption || '', m)
    } else if (type === 'videoMessage') {
      await this.sendFile(m.chat, buffer, 'video.mp4', media.caption || '', m)
    } else if (type === 'audioMessage') {
      await this.sendFile(m.chat, buffer, 'audio.mp3', null, m, true, {
        type: 'audioMessage',
        ptt: true
      })
    }
  } catch (e) {
    console.error('[❌ ERROR viewOnce auto]', e)
  }

  return !0
}

export default handler

import { downloadContentFromMessage } from '@whiskeysockets/baileys'
