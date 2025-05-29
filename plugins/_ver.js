import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = m => m

handler.all = async function (m, { conn }) {
  const viewOnce = m.message?.viewOnceMessage || m.message?.viewOnceMessageV2
  if (!viewOnce?.message) return

  const msg = viewOnce.message
  const type = Object.keys(msg)[0]

  if (!['imageMessage', 'videoMessage'].includes(type)) return

  try {
    const media = msg[type]
    const mime = media?.mimetype || ''
    const ext = mime.includes('video') ? 'mp4' : 'jpg'

    const stream = await downloadContentFromMessage(media, type.replace('Message', ''))
    let buffer = Buffer.concat([])
    for await (let chunk of stream) buffer = Buffer.concat([buffer, chunk])

    await conn.sendFile(m.chat, buffer, `viewonce.${ext}`, media.caption || '', m)
  } catch (err) {
    console.error('Error viewOnce:', err)
    await conn.reply(m.chat, `❌ Error al reenviar viewOnce:\n${err.message}`, m)
  }
}

export default handler
