import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = m => m

handler.all = async function (m, { conn }) {
  let chat = db.data.chats[m.chat]
  if (!chat?.autosticker || !m.isGroup) return // puedes cambiar esta condición si quieres que funcione en privados también

  if (!m?.message) return
  let msgContent = Object.values(m.message || {})[0]
  if (!msgContent?.contextInfo?.isViewOnce) return

  let quoted = msgContent?.contextInfo?.quotedMessage
  if (!quoted) return

  let type = Object.keys(quoted)[0]
  let media = quoted[type]
  let stream = await downloadContentFromMessage(media, type.replace('Message', ''))
  let buffer = Buffer.concat([])

  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }

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
