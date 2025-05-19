var handler = async (m, { conn, participants, usedPrefix, command }) => {
  // ———————————————————————————————————————
  // 1. Validar que se mencionó o se respondió a alguien
  // ———————————————————————————————————————
  if (!m.mentionedJid?.[0] && !m.quoted) {
    return conn.reply(
      m.chat,
      `${e} *Ejemplo:* ${usedPrefix + command} @${prems}`,
      m
    )
  }

  // ———————————————————————————————————————
  // 2. Obtener el JID de la persona a expulsar
  // ———————————————————————————————————————
  const user = m.mentionedJid?.[0] || m.quoted.sender

  // Datos del grupo y propietarios
  const groupInfo  = await conn.groupMetadata(m.chat)
  const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
  const ownerBot   = global.owner[0][0] + '@s.whatsapp.net'

  // Lista de admins actuales
  const admins = participants
    .filter(p => p.admin)        // “admin” o “superadmin”
    .map(p => p.id)

  // ———————————————————————————————————————
  // 3. Bloqueos de seguridad
  // ———————————————————————————————————————
  if (user === conn.user.jid)
    return conn.reply(m.chat, `${e} No puedo eliminar al bot (yo) del grupo`, m)

  if (user === ownerGroup)
    return conn.reply(m.chat, `${e} No puedo eliminar al propietario del grupo`, m)

  if (user === ownerBot)
    return conn.reply(m.chat, `${e} No puedo eliminar al propietario del bot`, m)

  if (admins.includes(user))
    return conn.reply(m.chat, `${e} No puedo eliminar a los administradores`, m)

  // ———————————————————————————————————————
  // 4. Expulsar al usuario
  // ———————————————————————————————————————
  await conn.groupParticipantsUpdate(m.chat, [user], 'remove')

  // ———————————————————————————————————————
  // 5. Si el admin usó .kick respondiendo a un mensaje,
  //    intentar borrarlo para todos (solo si el mensaje
  //    fue enviado por el bot y dentro de la ventana de tiempo)
  // ———————————————————————————————————————
  if (m.quoted) {
    try {
      await conn.sendMessage(m.chat, { delete: m.quoted.key })
    } catch (err) {
      console.error('No se pudo borrar el mensaje citado:', err)
    }
  }
}

handler.command = ['ban', 'kick', 'echar', 'hechar', 'b', 'bam']
handler.admin    = true   // Solo admins del grupo
handler.group    = true   // Solo grupos
handler.botAdmin = true   // El bot debe ser admin

export default handler
