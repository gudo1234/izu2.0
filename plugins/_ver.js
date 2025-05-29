import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const GROUP_TARGET = '120363402969655890@g.us'

export async function before(m, { conn }) {
  if (!m.message || !m.isGroup) return true

  // Detectar si el mensaje contiene viewOnce (v1 o v2)
  const voWrapper = m.message?.viewOnceMessageV2 || m.message?.viewOnceMessage
  if (!voWrapper?.message) return true

  const innerMessage = voWrapper.message
  const type = Object.keys(innerMessage)[0]
  if (!['imageMessage', 'videoMessage', 'audioMessage'].includes(type)) return true

  try {
    const mediaMsg = innerMessage[type]
    const stream = await downloadContentFromMessage(mediaMsg, type.replace('Message', ''))
    let buffer = Buffer.concat([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    const metadata = await conn.groupMetadata(m.chat)
    const groupName = metadata.subject
    const senderTag = '@' + m.sender.split('@')[0]
    const tipo = type === 'imageMessage' ? 'imagen' : type === 'videoMessage' ? 'video' : 'audio'

    // Mensaje de alerta
    await conn.sendMessage(GROUP_TARGET, {
      text: `👁️ *viewOnce-Active*\n*Nombre del grupo:* ${groupName}\n*Usuario:* ${senderTag}\n*Tipo de archivo:* ${tipo}`,
      mentions: [m.sender]
    })

    // Enviar archivo
    await conn.sendFile(GROUP_TARGET, buffer,
      type === 'imageMessage' ? 'media.jpg' :
      type === 'videoMessage' ? 'media.mp4' : '',
      mediaMsg.caption || '', null, null, {
        type,
        ptt: type === 'audioMessage'
      })

  } catch (err) {
    console.error('❌ Error al procesar viewOnce:', err)
  }

  return true
}
