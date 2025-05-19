var handler = async (m, { conn, participants, usedPrefix, command }) => {
  // 1. Validar mención o respuesta
  if (!m.mentionedJid?.[0] && !m.quoted) {
    return conn.reply(
      m.chat,
      `${e} *Ejemplo:* ${usedPrefix + command} @${prems}`,
      m
    )
  }

  // 2. JID a expulsar
  const user = m.mentionedJid?.[0] || m.quoted.sender

  // Datos grupo / propietarios
  const groupInfo  = await conn.groupMetadata(m.chat)
  const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
  const ownerBot   = global.owner[0][0] + '@s.whatsapp.net'

  // Lista admins
  const admins = participants
    .filter(p => p.admin)
    .map(p => p.id)

  // 3. Bloqueos de seguridad CON mensajes
  if (user === conn.user.jid)
    return conn.reply(m.chat, `${e} No puedo eliminar al bot (yo) del grupo`, m)

  if (user === ownerGroup)
    return conn.reply(m.chat, `${e} No puedo eliminar al *propietario del grupo*`, m)

  if (user === ownerBot)
    return conn.reply(m.chat, `${e} No puedo eliminar al *propietario del bot*`, m)

  if (admins.includes(user))
    return conn.reply(m.chat, `${e} No puedo eliminar a los *administradores*`, m)

  // 4. Expulsar
  await conn.groupParticipantsUpdate(m.chat, [user], 'remove')

  // 5. Borrar el mensaje citado (si existía)
  if (m.quoted) {
    try {
      const deleteKey = {
        remoteJid: m.chat,
        id:        m.quoted.id || m.quoted.key.id,
        fromMe:    m.quoted.key.fromMe || false,
        ...(m.quoted.key.participant
          ? { participant: m.quoted.key.participant }
          : {})
      }
      await conn.sendMessage(m.chat, { delete: deleteKey })
    } catch (err) {
      console.error('No se pudo borrar el mensaje citado:', err)
    }
  }
}

handler.command = ['ban', 'kick', 'echar', 'hechar', 'b', 'bam']
handler.admin    = true
handler.group    = true
handler.botAdmin = true

export default handler
