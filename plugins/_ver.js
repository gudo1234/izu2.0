import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const GROUP_TARGET = '120363402969655890@g.us'

export async function before(m, { conn }) {
  if (!m.message || !m.isGroup) return true

  const viewOnce = m.message?.viewOnceMessage || m.message?.viewOnceMessageV2
  if (!viewOnce?.message) return true

  const content = viewOnce.message
  const type = Object.keys(content)[0]
  const allowedTypes = ['imageMessage', 'videoMessage', 'audioMessage']
  if (!allowedTypes.includes(type)) return true

  try {
    const media = content[type]
    const stream = await downloadContentFromMessage(media, type.replace('Message', ''))
    let buffer = Buffer.concat([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    await conn.sendFile(GROUP_TARGET, buffer,
      type === 'imageMessage' ? 'media.jpg' :
      type === 'videoMessage' ? 'media.mp4' : '',
      media.caption || '', null, null, {
        type,
        ptt: type === 'audioMessage'
      })

  } catch (err) {
    console.error('[❌ Error en viewOnce auto]', err)
    await conn.reply(m.chat, `❌ Error al procesar viewOnce:\n${err.message}`, m)
  }

  return true
}
