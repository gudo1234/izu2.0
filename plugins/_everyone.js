let handler = async (m, { conn, text, participants, command, groupMetadata }) => {
  try {
    const users = participants
      .map(u => u.id)
      .filter(v => v !== conn.user.jid);

    const groupName = groupMetadata?.subject || 'este grupo';

    // El texto que simula la mención al grupo con @
    const groupMentionText = `@${groupName}`;

    // Mensaje final: "@Grupo texto opcional"
    const finalMsg = text?.trim() ? `${groupMentionText} ${text.trim()}` : groupMentionText;

    await conn.sendMessage(m.chat, {
      text: finalMsg,
      mentions: users,
      contextInfo: {
        mentionedJid: users,
        groupMentions: [{
          groupJid: m.chat,
          groupSubject: groupName
        }]
      }
    });
  } catch (error) {
    console.error('Error en comando everyone:', error);
    await m.reply('❌ Ocurrió un error al ejecutar el comando.');
  }
};

handler.command = ['everyone'];
handler.admin = true;
handler.group = true;

export default handler;
