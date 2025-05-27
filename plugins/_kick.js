var handler = async (m, { conn, participants, args, usedPrefix, command }) => {
  const groupInfo = await conn.groupMetadata(m.chat);
  const ownerGroup = groupInfo.owner || `${m.chat.split`-`[0]}@s.whatsapp.net`;
  const ownerBot = `${global.owner[0][0]}@s.whatsapp.net`;
  const admins = participants.filter(p => p.admin).map(p => p.id);

  // Si hay menciones o mensaje citado
  if ((m.mentionedJid && m.mentionedJid.length) || m.quoted) {
    const user = m.mentionedJid[0] || m.quoted.sender;

    if (user === conn.user.jid)
      return conn.reply(m.chat, `${e} No puedo eliminarme yo (bot) del grupo.`, m);

    if (user === ownerGroup)
      return conn.reply(m.chat, `${e} No puedo eliminar al propietario del grupo.`, m);

    if (user === ownerBot)
      return conn.reply(m.chat, `${e} No puedo eliminar al propietario del bot.`, m);

    if (admins.includes(user))
      return conn.reply(m.chat, `${e} No puedo eliminar a otro administrador del grupo.`, m);

    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
    return;
  }

  // Si se pasa un prefijo numérico
  if (args[0] && !isNaN(args[0])) {
    const prefix = args[0];

    let targets = participants.filter(p =>
      p.id.startsWith(prefix) &&
      p.id !== conn.user.jid &&
      p.id !== ownerGroup &&
      p.id !== ownerBot &&
      !admins.includes(p.id)
    ).map(p => p.id);

    if (targets.length === 0)
      return conn.reply(m.chat, `${e} *No se encontró ningún miembro con el prefijo* ${prefix} *que pueda ser expulsado.*`, m);

    conn.reply(m.chat, `*Expulsando a ${targets.length} usuarios con el prefijo ${prefix}...*`, m);

    for (let id of targets) {
      await conn.groupParticipantsUpdate(m.chat, [id], 'remove');
      await new Promise(resolve => setTimeout(resolve, 4000));
    }

    return conn.reply(m.chat, '*Expulsión finalizada.*', m);
  }

  return conn.reply(m.chat, `${e} *Ejemplos de uso:* _Para expulsar a un usuario usa:_ \`${usedPrefix + command}\` @usuario\n> Para expulsar a todos los usuarios cuyo número comienza con un prefijo específico, utiliza: ${usedPrefix + command} <prefijo>\n\n*Ejemplo:* \`${usedPrefix + command}\` 212 _(esto expulsará a todos los usuarios cuyo número comience con +212)_`, m);
};

//handler.command = ['kick', 'ban', 'echar', 'hechar', 'b', 'bam'];
handler.command = ['kio']
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
