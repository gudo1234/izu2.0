import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = m => m

handler.all = async function (m, { conn }) {
  if (!m.isGroup) return

  const vo = m.message?.viewOnceMessage || m.message?.viewOnceMessageV2
  if (!vo?.message) return

  const msg = vo.message
  const type = Object.keys(msg)[0]

  if (!['imageMessage', 'videoMessage'].includes(type)) return

  try {
    let media = msg[type]
    let mime = media?.mimetype || ''

    let stream = await downloadContentFromMessage(media, type.replace('Message', ''))
    let buffer = Buffer.concat([])
    for await (let chunk of stream) buffer = Buffer.concat([buffer, chunk])

    await conn.sendFile(m.chat, buffer,
      type === 'imageMessage' ? 'foto.jpg' : 'video.mp4',
      media.caption || '', m, null, {
        asDocument: false,
        mimetype: mime
      })

  } catch (e) {
    console.error('[❌ ERROR ViewOnce Auto]', e)
    await conn.reply(m.chat, `❌ Error al ver viewOnce:\n${e.message}`, m)
  }
}

export default handler
