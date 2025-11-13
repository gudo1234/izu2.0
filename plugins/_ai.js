var handler = async (m, { conn, participants, args, usedPrefix, command }) => {
  //const e = '⚠️' // emoji base para avisos
  const groupInfo = await conn.groupMetadata(m.chat)
  const ownerGroup = groupInfo.owner || `${m.chat.split`-`[0]}@s.whatsapp.net`
  const ownerBot = `${global.owner[0][0]}@s.whatsapp.net`
  const admins = participants.filter(p => p.admin).map(p => p.id)

  // Filtrar candidatos para mostrar ejemplo
  const candidates = participants.filter(p =>
    p.id !== conn.user.jid &&
    p.id !== ownerGroup &&
    p.id !== ownerBot
  )
  const randomUser = candidates[Math.floor(Math.random() * candidates.length)]?.id || 'usuario@s.whatsapp.net'

  // === Si hay menciones o mensaje citado ===
  if ((m.mentionedJid && m.mentionedJid.length) || m.quoted) {
    const user = m.mentionedJid[0] || m.quoted.sender

    if (user === conn.user.jid)
      return conn.reply(m.chat, `${e} No puedo eliminarme yo (bot).`, m)

    if (user === ownerGroup)
      return conn.reply(m.chat, `${e} No puedo eliminar al propietario del grupo.`, m)

    if (user === ownerBot)
      return conn.reply(m.chat, `${e} No puedo eliminar al propietario del bot.`, m)

    if (admins.includes(user))
      return conn.reply(m.chat, `${e} No puedo eliminar a otro administrador del grupo.`, m)

    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
    return
  }

  // === Si se pasa un prefijo o varios ===
  if (args[0]) {
    // Quita "+" y divide por coma
    let prefixes = args[0].split(',').map(x => x.replace(/^\+/, '').trim()).filter(Boolean)

    if (!prefixes.length)
      return conn.reply(m.chat, `${e} Ingresa al menos un prefijo numérico.`, m)

    // Buscar coincidencias en los participantes
    let targets = participants.filter(p =>
      prefixes.some(pre => p.id.startsWith(pre)) &&
      p.id.endsWith('@s.whatsapp.net') &&
      ![conn.user.jid, ownerGroup, ownerBot].includes(p.id) &&
      !admins.includes(p.id)
    ).map(p => p.id)

    if (targets.length === 0)
      return conn.reply(m.chat, `${e} *No se encontró ningún miembro con los prefijos:* ${prefixes.join(', ')}`, m)

    conn.reply(m.chat, `🚫 *Expulsando ${targets.length} usuario(s)* con prefijo(s): ${prefixes.join(', ')}`, m)

    // Expulsión con pausa de 3 segundos entre cada uno
    for (let id of targets) {
      await conn.groupParticipantsUpdate(m.chat, [id], 'remove')
      await new Promise(r => setTimeout(r, 3000))
    }

    return conn.reply(m.chat, `✅ *Expulsión finalizada (${targets.length} usuario${targets.length > 1 ? 's' : ''}).*`, m)
  }

  // === Mensaje de ayuda ===
  return conn.reply(
    m.chat,
    `${e} *Ejemplos de uso:*\n` +
    `✦ Expulsar a un usuario:\n\`${usedPrefix + command}\` @${randomUser.split('@')[0]}\n\n` +
    `✦ Expulsar por prefijo:\n\`${usedPrefix + command}\` 212\n` +
    `✦ Expulsar varios prefijos:\n\`${usedPrefix + command}\` 212,91,62\n\n` +
    `Esto eliminará a todos los miembros cuyos números empiecen con esos prefijos.`,
    m,
    { mentions: [randomUser] }
  )
}

//handler.command = ['ban', 'kick', 'echar', 'hechar', 'b', 'bam', 'kicknum']
handler.command = ['io']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
