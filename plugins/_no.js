let handler = async (m, { conn, text, participants, command }) => {
  const users = participants
    .map(u => u.id)
    .filter(v => v !== conn.user.jid)

  // Dividir solo en el PRIMER "|", permitiendo emojis, caracteres raros, = _ etc.
  let link = null
  let msg = null

  if (text) {
    const index = text.indexOf('|')
    if (index !== -1) {
      link = text.slice(0, index).trim()
      msg = text.slice(index + 1).trim()
    } else {
      link = text.trim()
    }
  }

  if (!link)
    return m.reply(
      `*Uso correcto:*\n` +
      `» Responde a un mensaje con *.${command}* para etiquetar a todos\n` +
      `» O escribe *.${command} <link del grupo>|<tu texto>*`
    )

  // Aceptar enlaces con cualquier carácter permitido
  // Soporta links como:
  // https://chat.whatsapp.com/IWaeL319lvwG2KllObjKHD?mode=ems_copy_c
  let code = link.match(/chat\.whatsapp\.com\/([A-Za-z0-9=_-]+)/)

  if (!code) return m.reply('Enlace de grupo no válido.')

  let groupId = code[1]

  // Intentar unirse
  let res = await conn.groupAcceptInvite(groupId).catch(() => groupId)
  if (!res) return m.reply('No pude unirme al grupo (enlace vencido o privado).')

  let groupMetadata = await conn.groupMetadata(res).catch(() => null)
  if (!groupMetadata) return m.reply('No se pudo obtener la información del grupo.')

  let groupUsers = groupMetadata.participants.map(u => u.id)

  let enviado = false

  // -----------------------------
  // SI HAY UN MENSAJE CITADO
  // -----------------------------
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

  // -----------------------------
  // SI SOLO HAY TEXTO
  // -----------------------------
  if (!enviado && msg?.trim()) {
    await conn.sendMessage(res, { text: msg, mentions: groupUsers })
    enviado = true
  }

  if (enviado) await m.react('✅')
  else return m.reply(`Debes responder a un mensaje o escribir texto después del enlace.`)
}

handler.command = ['no']
handler.owner = true
export default handler
