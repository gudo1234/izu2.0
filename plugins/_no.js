let handler = async (m, { conn, text, participants, command }) => {
  const users = participants
    .map(u => u.id)
    .filter(v => v !== conn.user.jid) // Excluye al bot

  if (!text) return m.reply(
    `*Uso correcto:*\n` +
    `» Responde a un mensaje con *.${command}* para etiquetar a todos\n` +
    `» O escribe *.${command} <link del grupo> <tu texto>* para enviar un texto mencionando a todos`
  )

  // Extraer enlace y mensaje completo (manteniendo emojis y caracteres especiales)
  const match = text.trim().match(/(https?:\/\/chat\.whatsapp\.com\/[0-9A-Za-z]+(?:\?.*)?)([\s\S]*)/)
  if (!match) return m.reply('Enlace de grupo no válido.')

  const link = match[1]
  const msg = (match[2] || '').trim() // mensaje completo con cualquier carácter

  // Obtener el código del grupo
  const codeMatch = link.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)(\?.*)?/)
  if (!codeMatch) return m.reply('Enlace de grupo no válido.')
  const groupId = codeMatch[1]

  // Intentar unirse al grupo (si ya estás, solo continúa)
  const res = await conn.groupAcceptInvite(groupId).catch(() => groupId)
  if (!res) return m.reply('No pude unirme al grupo (enlace vencido o privado).')

  // Obtener información del grupo
  const groupMetadata = await conn.groupMetadata(res).catch(() => null)
  if (!groupMetadata) return m.reply('No se pudo obtener la información del grupo.')
  const groupUsers = groupMetadata.participants.map(u => u.id)

  let enviado = false

  // Si hay mensaje citado
  if (m.quoted) {
    const q = m.quoted
    const type = (q.mimetype || q.mediaType || q.mtype || '').toLowerCase()
    const buffer = await q.download().catch(() => null)

    if (buffer) {
      if (/image/.test(type)) {
        await conn.sendMessage(res, { image: buffer, caption: msg, mentions: groupUsers })
        enviado = true
      } else if (/video/.test(type)) {
        await conn.sendMessage(res, { video: buffer, caption: msg, mentions: groupUsers })
        enviado = true
      } else if (/sticker/.test(type)) {
        await conn.sendMessage(res, { sticker: buffer, mentions: groupUsers })
        if (msg) await conn.sendMessage(res, { text: msg, mentions: groupUsers })
        enviado = true
      } else {
        await conn.sendMessage(res, { document: buffer, caption: msg, mentions: groupUsers })
        enviado = true
      }
    }
  }

  // Si solo hay texto
  if (msg && !enviado) {
    await conn.sendMessage(res, { text: msg, mentions: groupUsers })
    enviado = true
  }

  if (enviado) await m.react('✅')
  else return m.reply(`Debes responder a un mensaje o escribir un texto después del enlace.`)
}

handler.command = ['no']
handler.owner = true
export default handler
