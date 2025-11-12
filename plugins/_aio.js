import PhoneNumber from 'awesome-phonenumber'

const handler = async (m, { conn, participants, args, usedPrefix, command }) => {
  const groupInfo = await conn.groupMetadata(m.chat)
  const ownerGroup = groupInfo.owner || `${m.chat.split`-`[0]}@s.whatsapp.net`
  const ownerBot = `${global.owner[0][0]}@s.whatsapp.net`
  const admins = participants.filter(p => p.admin).map(p => p.id)

  const candidates = participants.filter(p =>
    p.id !== conn.user.jid &&
    p.id !== ownerGroup &&
    p.id !== ownerBot
  )
  const randomUser = candidates[Math.floor(Math.random() * candidates.length)]?.id || 'usuario@s.whatsapp.net'

  // Kick por mención o mensaje citado
  if ((m.mentionedJid && m.mentionedJid.length) || m.quoted) {
    const user = m.mentionedJid[0] || m.quoted.sender

    if (user === conn.user.jid)
      return conn.reply(m.chat, `${e} No puedo eliminarme yo (bot) del grupo.`, m)
    if (user === ownerGroup)
      return conn.reply(m.chat, `${e} No puedo eliminar al propietario del grupo.`, m)
    if (user === ownerBot)
      return conn.reply(m.chat, `${e} No puedo eliminar al propietario del bot.`, m)
    if (admins.includes(user))
      return conn.reply(m.chat, `${e} No puedo eliminar a otro administrador del grupo.`, m)

    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
    return
  }

  // Kick por prefijo usando número real
  if (args[0]) {
    const prefix = args[0].replace(/\D/g, '') // solo dígitos

    const targets = participants.map(p => {
      // Obtener número real del participante
      const idNum = p.id.split('@')[0].replace(/\D/g, '')
      const pn = new PhoneNumber('+' + idNum) // opcional si querés validar
      return { jid: `+${idNum}@s.whatsapp.net`, number: idNum, admin: p.admin }
    }).filter(p =>
      p.number.startsWith(prefix) &&
      p.jid !== conn.user.jid &&
      p.jid !== ownerGroup &&
      p.jid !== ownerBot &&
      !p.admin
    )

    if (targets.length === 0)
      return conn.reply(m.chat, `${e} *No se encontró ningún miembro con el prefijo* ${args[0]} *que pueda ser expulsado.*`, m)

    conn.reply(m.chat, `*Expulsando a ${targets.length} usuario(s) con el prefijo ${args[0]}*`, m)

    for (const t of targets) {
      await conn.groupParticipantsUpdate(m.chat, [t.jid], 'remove')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }

    return conn.reply(m.chat, '*Expulsión finalizada.*', m)
  }

  // Mensaje de ayuda
  return conn.reply(m.chat, `${e} *Ejemplos de uso:*\n` +
    `✑ _Para expulsar a un usuario usa:_ \`${usedPrefix + command}\` @${randomUser.split('@')[0]}\n` +
    `> Para expulsar a todos los usuarios cuyo número comienza con un prefijo específico: *${usedPrefix + command} <prefijo>*\n\n` +
    `*Ejemplo:* \`${usedPrefix + command}\` 212 (esto expulsará a todos los usuarios cuyo número comience con +212)`,
    m, { mentions: [randomUser] }
  )
}

//handler.command = ['ban', 'kick', 'echar', 'hechar', 'b', 'bam', 'kicknum']
handler.command = ['io']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
