import PhoneNumber from 'awesome-phonenumber'

var handler = async (m, { conn, participants, args, usedPrefix, command }) => {
  // === 🧩 FUNCIÓN PARA BURLAR EL LID ===
  let sender = ''
  if (m.key.fromMe) {
    sender = conn.user?.jid || conn.user?.id || conn.user?.lid?.split(':')[0] + '@lid' || ''
  } else if (m.participant) {
    sender = m.participant
  } else if (m.key.participant) {
    sender = m.key.participant
  } else if (m.key.remoteJid?.endsWith('@g.us')) {
    sender = m.sender || m.key.participant || ''
  } else {
    sender = m.key.remoteJid || m.sender || ''
  }

  if (!sender && m.sender) sender = m.sender
  if (!sender && m.chat && !m.isGroup) sender = m.chat

  let response = {}

  if (m.isGroup) {
    const metadata = await conn.groupMetadata(m.chat).catch(() => null) || {}
    response.metadata = metadata

    response.admins = metadata.participants?.filter(p => p.admin)?.map(p => ({
      id: p.id || p.jid,
      admin: p.admin
    })) || []

    const user = metadata.participants?.find(u => (u.id || u.jid) === sender) || {}
    response.isRAdmin = user.admin === 'superadmin'
    response.isAdmin = response.isRAdmin || user.admin === 'admin'
    response.isBotAdmin = response.admins.some(a =>
      a.id === conn.user.jid ||
      a.id === conn.user?.id ||
      a.id === (conn.user.lid?.split(':')[0] + '@lid')
    )
  }

  if (sender?.endsWith('@lid')) {
    const match = response.metadata?.participants?.find(
      p => p.id === sender || p.jid === sender
    )
    if (match) sender = match.jid || match.id
  }

  response.sender = sender

  // === 🧩 VARIABLES DE GRUPO Y ADMINS ===
  const groupInfo = response.metadata || (await conn.groupMetadata(m.chat))
  const ownerGroup = groupInfo.owner || `${m.chat.split`-`[0]}@s.whatsapp.net`
  const ownerBot = `${global.owner[0][0]}@s.whatsapp.net`
  const admins = groupInfo.participants?.filter(p => p.admin).map(p => p.id) || []

  // Elegir un usuario aleatorio válido
  const candidates = groupInfo.participants.filter(p =>
    p.id !== conn.user.jid &&
    p.id !== ownerGroup &&
    p.id !== ownerBot
  )
  const randomUser = candidates[Math.floor(Math.random() * candidates.length)]?.id || 'usuario@s.whatsapp.net'

  const e = '🚫'

  // === 💬 Si hay menciones o mensaje citado ===
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

  // === 🔢 Si se pasa un prefijo numérico ===
  if (args[0] && !isNaN(args[0])) {
    const prefix = args[0]

    let targets = groupInfo.participants.filter(p =>
      p.id.startsWith(prefix) &&
      p.id !== conn.user.jid &&
      p.id !== ownerGroup &&
      p.id !== ownerBot &&
      !admins.includes(p.id)
    ).map(p => p.id)

    if (targets.length === 0)
      return conn.reply(m.chat, `${e} *No se encontró ningún miembro con el prefijo* ${prefix} *que pueda ser expulsado.*`, m)

    conn.reply(m.chat, `*Expulsando a ${targets.length} usuario(s) con el prefijo ${prefix}*`, m)

    for (let id of targets) {
      await conn.groupParticipantsUpdate(m.chat, [id], 'remove')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }

    return conn.reply(m.chat, '*Expulsión finalizada.*', m)
  }

  // === 📢 Mensaje de ayuda ===
  return conn.reply(m.chat,
    `${e} *Ejemplos de uso:*\n` +
    `✑ _Para expulsar a un usuario usa:_ \`${usedPrefix + command}\` @${randomUser.split('@')[0]}\n` +
    `> Para expulsar a todos los usuarios cuyo número comienza con un prefijo específico: *${usedPrefix + command} <prefijo>*\n\n` +
    `*Ejemplo:* \`${usedPrefix + command}\` 212 (esto expulsará a todos los usuarios cuyo número comience con +212)`,
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
