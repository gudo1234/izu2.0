let handler = async (m, { conn, text, participants, command }) => {
  const users = participants.map(u => u.id).filter(v => v !== conn.user.jid)

  if (!text && !m.quoted) {
    return m.reply(
      `*Uso correcto:*\n` +
      `» Responde a un mensaje con *.${command}* para etiquetar a todos\n` +
      `» O escribe *.${command} <link del grupo>|<tu texto>*\n` +
      `» También funciona si pegas el link y luego el texto sin '|'`
    )
  }

  let link = null
  let msg = null

  if (text) {
    // Primero, si hay '|' dividir por el primer '|'
    const pipeIndex = text.indexOf('|')
    if (pipeIndex !== -1) {
      link = text.slice(0, pipeIndex).trim()
      msg = text.slice(pipeIndex + 1).trim()
    } else {
      // Regex robusta:
      // - captura "chat.whatsapp.com/<ID>"
      // - opcionalmente captura "?" y todos los chars válidos de query hasta un separador (espacio, comilla, paréntesis)
      // Esto permite: ...?mode=ems_copy_c y deja fuera si viene seguido de console.log(...
      const urlRegex = /chat\.whatsapp\.com\/[A-Za-z0-9_-]+(?:\?[^\s'")]+)?/i
      const urlMatch = text.match(urlRegex)
      if (urlMatch) {
        link = urlMatch[0]
        // todo lo que venga despues de la URL real (después de la coincidencia) será el mensaje
        const after = text.slice(urlMatch.index + urlMatch[0].length).trim()
        msg = after || null
      } else {
        // Si no hay URL detectada, asumimos que text puede ser solo el código o texto suelto
        link = text.trim()
        msg = null
      }
    }
  }

  if (!link && !m.quoted) return m.reply('Enlace de grupo no válido o no proporcionado.')

  // Extraer SOLO el ID (la parte alfanumérica) para groupAcceptInvite
  const idMatch = (link || '').match(/chat\.whatsapp\.com\/([A-Za-z0-9_-]+)/i)
  if (!idMatch) return m.reply('No pude leer el código del enlace del grupo. Revisa el link.')
  const inviteId = idMatch[1]

  // Intentar unirse (si ya eres miembro, catch devuelve el id)
  let res = await conn.groupAcceptInvite(inviteId).catch(() => inviteId)
  if (!res) return m.reply('No pude unirme al grupo (enlace vencido o privado).')

  let groupMetadata = await conn.groupMetadata(res).catch(() => null)
  if (!groupMetadata) return m.reply('No se pudo obtener la información del grupo.')

  let groupUsers = groupMetadata.participants.map(u => u.id)
  let enviado = false

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
    } else if (!enviado && !msg && q.text) {
      await conn.sendMessage(res, { text: q.text, mentions: groupUsers })
      enviado = true
    }
  }

  if (!enviado && msg?.trim()) {
    await conn.sendMessage(res, { text: msg, mentions: groupUsers })
    enviado = true
  }

  if (enviado) await m.react('✅')
  else return m.reply('No se envió nada. Asegúrate de responder a un mensaje o incluir texto después del enlace.')
}

handler.command = ['no']
handler.owner = true
export default handler
