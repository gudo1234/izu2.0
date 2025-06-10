let handler = async (m, { conn, participants, text }) => {
  const metadata = await conn.groupMetadata(m.chat);
  const members = metadata.participants.map(p => p.id);
  //const whitelist = global.db.data.chats[m.chat]?.whitelist || []; // Asumiendo whitelist desde base de datos

  //const usuarios = members.filter(id => !whitelist.includes(id));
  const message = text?.trim() || 'Hola 😃';

  await m.reply(`@${m.sender} ${message}`, {
    contextInfo: {
      mentionedJid: usuarios,
      groupMentions: [{
        groupJid: m.chat,
        groupSubject: metadata.subject
      }]
    }
  });
};

handler.command = ['everyone'];
handler.group = true;
handler.admin = true;
export default handler;
