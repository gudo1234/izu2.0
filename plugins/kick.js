var handler = async (m, { conn, participants, usedPrefix, command }) => {
  if (!m.mentionedJid[0] && !m.quoted) {
    return conn.reply(
      m.chat,
      `${e} *Ejemplo:* ${usedPrefix + command} @${prems}`,
      m
    );
  }
  const user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;
  const groupInfo   = await conn.groupMetadata(m.chat);
  const ownerGroup  = groupInfo.owner || `${m.chat.split`-`[0]}@s.whatsapp.net`;
  const ownerBot    = `${global.owner[0][0]}@s.whatsapp.net`;
  if (user === conn.user.jid)
    return conn.reply(m.chat, `${e} No puedo eliminarme yo (bot) del grupo.`, m);

  if (user === ownerGroup)
    return conn.reply(m.chat, `${e} No puedo eliminar al propietario del grupo.`, m);

  if (user === ownerBot)
    return conn.reply(m.chat, `${e} No puedo eliminar al propietario del bot.`, m);
  const isAdmin = groupInfo.participants
    .some(p => p.admin && p.id === user);

  if (isAdmin) {
    return conn.reply(
      m.chat,
      `${e} No puedo eliminar a otro administrador del grupo.`,
      m
    );
  }
  await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
};

handler.command  = ['ban', 'kick', 'echar', 'hechar', 'b', 'bam'];
handler.admin    = true;
handler.group    = true;
handler.botAdmin = true;
export default handler;
