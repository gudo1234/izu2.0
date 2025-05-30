import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = m => m

handler.all = async function (m) {
  // Lógica de detección tipo autosticker
  let q = m
  let mime = (q.msg || q).mimetype || q.mediaType || ''
  if (!q?.message) return

  let content = Object.values(q.message || {})[0]
  if (!content?.contextInfo?.isViewOnce) return

  let quoted = content?.contextInfo?.quotedMessage
  if (!quoted) return

  let type = Object.keys(quoted)[0]
  let media = quoted[type]
  let stream = await downloadContentFromMessage(media, type.replace('Message', ''))
  let buffer = Buffer.concat([])

  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }

  // Mostrar automáticamente según tipo
  if (/imageMessage/.test(type)) {
    await this.sendFile(m.chat, buffer, 'photo.jpg', media.caption || '', m)
  } else if (/videoMessage/.test(type)) {
    await this.sendFile(m.chat, buffer, 'video.mp4', media.caption || '', m)
  } else if (/audioMessage/.test(type)) {
    await this.sendFile(m.chat, buffer, '', null, m, true, {
      type: 'audioMessage',
      ptt: true
    })
  }
}

export default handler
