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
    .filter(p => p.admin)
    .map(p => p.id)

  // ———————————————————————————————————————
  // 3. Bloqueos de seguridad (con mensajes)
  // ———————————————————————————————————————
  if (user === conn.user.jid)
    return conn.reply(m.chat, `${e} No puedo eliminar al bot (yo) del grupo`, m)

  if (user === ownerGroup)
    return conn.reply(m.chat, `${e} No puedo eliminar al *propietario del grupo*`, m)

  if (user === ownerBot)
    return conn.reply(m.chat, `${e} No puedo eliminar al *propietario del bot*`, m)

  if (admins.includes(user))
    return conn.reply(m.chat, `${e} No puedo eliminar a los *administradores*`, m)

  // ———————————————————————————————————————
  // 4. Expulsar al usuario
  // ———————————————————————————————————————
  await conn.groupParticipantsUpdate(m.chat, [user], 'remove')

  // ———————————————————————————————————————
  // 5. Borrar el mensaje prohibido (cualquier tipo) si se usó el comando respondiendo
  // ———————————————————————————————————————
  if (m.quoted) {
    try {
      // Clave original del mensaje citado
      const k = m.quoted.key   // { remoteJid, id, fromMe, participant? }

      // Aseguramos que participant esté presente cuando fromMe === false
      const deleteKey = {
        remoteJid: k.remoteJid,
        id:        k.id,
        fromMe:    k.fromMe,
        participant: k.participant || m.quoted.sender
      }

      await conn.sendMessage(m.chat, { delete: deleteKey })
    } catch (err) {
      console.error('No se pudo borrar el mensaje prohibido:', err)
    }
  }
}

handler.command = ['ban', 'kick', 'echar', 'hechar', 'b', 'bam']
handler.admin    = true   // Solo admins del grupo
handler.group    = true   // Solo grupos
handler.botAdmin = true   // El bot debe ser admin

export default handler
