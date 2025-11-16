let handler = async (m, { conn, text, participants, command }) => {
  const users = participants
    .map(u => u.id)
    .filter(v => v !== conn.user.jid) // Excluye al bot

  if (!text) return m.reply(
    `*Uso correcto:*\n` +
    `» Responde a un mensaje con *.${command}* para etiquetar a todos\n` +
    `» O escribe *.${command} <link del grupo> <tu texto>* para enviar un texto mencionando a todos`
  )

  // Separar el link del mensaje: el primer "palabra" es el link, el resto es el texto
  let [link, ...msgParts] = text.trim().split(/\s+/)
  let msg = msgParts.join(' ')

  if (!link) return m.reply('Debes poner un enlace de grupo válido.')

  // Obtener el código del grupo
  let code = link.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/)
  if (!code) return m.reply('Enlace de grupo no válido.')
  let groupId = code[1]

  // Intentar unirse al grupo (si ya estás, solo continúa)
  let res = await conn.groupAcceptInvite(groupId).catch(() => groupId)
  if (!res) return m.reply('No pude unirme al grupo (enlace vencido o privado).')

  let groupMetadata = await conn.groupMetadata(res).catch(() => null)
  if (!groupMetadata) return m.reply('No se pudo obtener la información del grupo.')
  let groupUsers = groupMetadata.participants.map(u => u.id)

  // Variable para saber si se envió algo
  let enviado = false

  // Si hay mensaje citado
  if (m.quoted) {
    const q = m.quoted
    const type = (q.mimetype || q.mediaType || q.mtype || '').toLowerCase()
    const buffer = await q.download().catch(() => null)

    if (buffer) {
      if (/image/.test(type)) {
        await conn.sendMessage(res, { image: buffer, caption: msg || '', mentions: groupUsers })
        enviado = true
      } else if (/video/.test(type)) {
        await conn.sendMessage(res, { video: buffer, caption: msg || '', mentions: groupUsers })
        enviado = true
      } else if (/sticker/.test(type)) {
        await conn.sendMessage(res, { sticker: buffer, mentions: groupUsers })
        if (msg) await conn.sendMessage(res, { text: msg, mentions: groupUsers })
        enviado = true
      } else {
        await conn.sendMessage(res, { document: buffer, caption: msg || '', mentions: groupUsers })
        enviado = true
      }
    }
  }

  // Si solo hay texto
  if (msg?.trim() && !enviado) {
    await conn.sendMessage(res, { text: msg, mentions: groupUsers })
    enviado = true
  }

  // Reaccionar solo una vez si se envió algo
  if (enviado) await m.react('✅')
  else return m.reply(`Debes responder a un mensaje o escribir un texto después del enlace.`)
}

handler.command = ['no']
handler.owner = true
//handler.group = true
export default handler
