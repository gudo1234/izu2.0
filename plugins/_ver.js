import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const GROUP_TARGET = '120363402969655890@g.us'

export async function before(m, { conn }) {
  if (!m.message || !m.isGroup) return true

  // Detectar mensaje de visualización única
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

    // Obtener datos del grupo y usuario
    const metadata = await conn.groupMetadata(m.chat)
    const groupName = metadata.subject
    const senderTag = '@' + m.sender.split('@')[0]
    const tipo = type.includes('image') ? 'imagen' : type.includes('video') ? 'video' : 'audio'

    // Mensaje informativo
    await conn.sendMessage(GROUP_TARGET, {
      text: `👁️ *viewOnce-Active*\n*Nombre del grupo:* ${groupName}\n*Usuario:* ${senderTag}\n*Tipo de archivo:* ${tipo}`,
      mentions: [m.sender]
    })

    // Enviar el archivo
    await conn.sendFile(GROUP_TARGET, buffer,
      tipo === 'imagen' ? 'media.jpg' :
      tipo === 'video' ? 'media.mp4' : '',
      media.caption || '', null, null, {
        type,
        ptt: tipo === 'audio'
      })

  } catch (err) {
    console.error('[❌ Error en viewOnce automático]', err)
  }

  return true
}
