let handler = async (m, { conn, participants, text, groupMetadata, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) throw 'Este comando solo funciona en grupos';
  if (!isAdmin && !isOwner) throw 'Solo los admins pueden usar este comando';
  //if (!isBotAdmin) throw 'Necesito ser admin para mencionar a todos';

  const groupName = groupMetadata.subject;
  const users = participants.map(p => p.id).filter(id => id !== conn.user.jid);
  const msg = text || 'Hola a todos 👋';

  await conn.sendMessage(m.chat, {
    text: `@${groupName} *${msg}*`,
    mentions: users
  }, { quoted: m });
};

handler.command = ['everyone']
handler.group = true;
handler.admin = true;
export default handler;
