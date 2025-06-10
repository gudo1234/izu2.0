let handler = async (m, { conn, participants, text }) => {
  const users = participants.map(p => p.id);
  const message = text?.trim() || 'Hola a todos 👋';

  await m.reply(message, {
    contextInfo: {
      mentionedJid: users
    }
  });
};

handler.command = ['everyone'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
