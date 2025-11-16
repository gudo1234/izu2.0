let handler = async (m, { conn, text, participants, command }) => {
  const users = participants
    .map(u => u.id)
    .filter(v => v !== conn.user.jid)

  // si no hay texto y no es reply, abortar
  if (!text && !m.quoted) {
    return m.reply(
      `*Uso correcto:*\n` +
      `» Responde a un mensaje con *.${command}* para etiquetar a todos\n` +
      `» O escribe *.${command} <link del grupo>|<tu texto>*\n` +
      `» También funciona si pegas el link y luego el texto sin '|'`
    )
  }

  // 1) intentar separar por el primer '|' (si existe)
  let link = null
  let msg = null
  if (text) {
    const pipeIndex = text.indexOf('|')
    if (pipeIndex !== -1) {
      link = text.slice(0, pipeIndex).trim()
      msg = text.slice(pipeIndex + 1).trim()
    } else {
      // 2) si no hay '|', intentar encontrar el link dentro del texto
      // buscamos "chat.whatsapp.com/<ID>" y capturamos el índice para extraer lo que venga después
      const regex = /chat\.whatsapp\.com\/([A-Za-z0-9=_-]+)/g
      const match = regex.exec(text)
      if (match) {
        link = match[0] // todo el fragmento coincidente (hasta el ID)
        const endIndex = match.index + match[0].length
        // lo que venga después del link en el texto original será el mensaje
        const rest = text.slice(endIndex).trim()
        // si el resto comienza con '?' o parámetros (p.ej. ?mode=...), puede formar parte del URL
        // comprobamos si justo después del ID hay un '?' en el texto original; si sí, incluimos hasta el final de la query
        // para eso buscamos en el texto original a partir de match.index el patrón completo del URL con opcionales params
        const fullUrlRegex = /chat\.whatsapp\.com\/([A-Za-z0-9=_-]+)(\?[^ ]*)?/
        const fullMatch = fullUrlRegex.exec(text.slice(match.index))
        if (fullMatch) {
          // la URL completa (con params) desde match.index
          const fullUrl = fullMatch[0]
          // recalculamos endIndex con la longitud de la fullUrl
          const fullEndIndex = match.index + fullUrl.length
          const rest2 = text.slice(fullEndIndex).trim()
          link = fullUrl
          msg = rest2 || null
        } else {
          msg = rest || null
        }
      } else {
        // si no hay link en el texto, quizás solo te pasaron texto (o viene por reply)
        link = text.trim() // por si el usuario pegó solo el link sin http
        msg = null
      }
    }
  }

  if (!link && !m.quoted) {
    return m.reply('Enlace de grupo no válido o no proporcionado. Usa el formato correcto.')
  }

  // Extraer solo el ID del invite (la parte alfanumérica) aunque el link tenga params
  const idMatch = (link || '').match(/chat\.whatsapp\.com\/([A-Za-z0-9=_-]+)/)
  if (!idMatch) {
    return m.reply('No pude leer el código del enlace del grupo. Revisa el link.')
  }
  const groupId = idMatch[1]

  // Intentar unirse al grupo; si ya está, groupAcceptInvite puede fallar y devolvemos el id
  let res = await conn.groupAcceptInvite(groupId).catch(() => groupId)
  if (!res) return m.reply('No pude unirme al grupo (enlace vencido o privado).')

  let groupMetadata = await conn.groupMetadata(res).catch(() => null)
  if (!groupMetadata) return m.reply('No se pudo obtener la información del grupo.')

  let groupUsers = groupMetadata.participants.map(u => u.id)
  let enviado = false

  // Si hay mensaje citado (media o texto)
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
      // si el citado es texto y no descargable, reenviarlo con menciones
      await conn.sendMessage(res, { text: q.text, mentions: groupUsers })
      enviado = true
    }
  }

  // Si hay texto (msg) y no se envió aún
  if (!enviado && msg?.trim()) {
    // mandar tal cual, soporta emojis y caracteres raros
    await conn.sendMessage(res, { text: msg, mentions: groupUsers })
    enviado = true
  }

  if (enviado) {
    await m.react('✅')
  } else {
    return m.reply('No se envió nada. Asegúrate de responder a un mensaje o incluir texto después del enlace.')
  }
}

handler.command = ['no']
handler.owner = true
export default handler
