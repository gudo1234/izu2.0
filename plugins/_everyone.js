let handler = async (m, { conn, text, participants, command, groupMetadata }) => {
  try {
    const users = participants
      .map(u => u.id)
      .filter(v => v !== conn.user.jid);

    const groupName = groupMetadata?.subject || 'este grupo';

    // Construyo el mensaje base con el nombre del grupo
    const baseMsg = `👥 *${groupName}*`;

    // Si hay texto, se concatena, si no, solo el grupo
    const finalMsg = text?.trim() ? `${baseMsg} ${text.trim()}` : baseMsg;

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
