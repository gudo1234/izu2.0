let handler = async (m, { conn, text, participants, command }) => {
  const users = participants.map(u => u.id).filter(v => v !== conn.user.jid)

  if (!text) return m.reply(
    `*Uso correcto:*\n` +
    `» Responde a un mensaje con *.${command}* para etiquetar a todos\n` +
    `» O escribe *.${command} <link del grupo> <tu texto>* para enviar un texto mencionando a todos`
  )

  // Extraer enlace y mensaje completo
  const match = text.trim().match(/(https?:\/\/chat\.whatsapp\.com\/[0-9A-Za-z]+(?:\?.*)?)([\s\S]*)/)
  if (!match) return m.reply('Enlace de grupo no válido.')

  const link = match[1]
  const msg = (match[2] || '').trim()

  const codeMatch = link.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)(\?.*)?/)
  if (!codeMatch) return m.reply('Enlace de grupo no válido.')
  const groupId = codeMatch[1]

  const res = await conn.groupAcceptInvite(groupId).catch(() => groupId)
  if (!res) return m.reply('No pude unirme al grupo (enlace vencido o privado).')

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
      // Enviar contenido primero, sin caption para no perderlo
      if (/image/.test(type)) {
        await conn.sendMessage(res, { image: buffer, mentions: groupUsers })
      } else if (/video/.test(type)) {
        await conn.sendMessage(res, { video: buffer, gifPlayback: false, mentions: groupUsers })
      } else if (/gif/.test(type) || (type === 'video/mp4' && q.message?.videoMessage?.gifPlayback)) {
        await conn.sendMessage(res, { video: buffer, gifPlayback: true, mentions: groupUsers })
      } else if (/sticker/.test(type)) {
        await conn.sendMessage(res, { sticker: buffer, mentions: groupUsers })
      } else {
        await conn.sendMessage(res, { document: buffer, mentions: groupUsers })
      }
      enviado = true
    }
  }

  // Siempre enviar el texto después, si existe
  if (msg) {
    await conn.sendMessage(res, { text: msg, mentions: groupUsers })
    enviado = true
  }

  if (enviado) await m.react('✅')
  else return m.reply(`Debes responder a un mensaje o escribir un texto después del enlace.`)
}

handler.command = ['no']
handler.owner = true
export default handler
