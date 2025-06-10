let handler = async (m, { conn, text, participants, command, groupMetadata }) => {
  try {
    const users = participants
      .map(u => u.id)
      .filter(v => v !== conn.user.jid);

    if (m.quoted) {
      return conn.sendMessage(m.chat, {
        forward: m.quoted.fakeObj,
        mentions: users,
        contextInfo: {
          mentionedJid: users,
          groupMentions: [{
            groupJid: m.chat,
            groupSubject: groupMetadata?.subject || ''
          }]
        }
      });
    }

    if (text?.trim()) {
      return conn.sendMessage(m.chat, {
        text,
        mentions: users,
        contextInfo: {
          mentionedJid: users,
          groupMentions: [{
            groupJid: m.chat,
            groupSubject: groupMetadata?.subject || ''
          }]
        }
      });
    }

    const prefix = command ? `.${command}` : '.totag';
    return m.reply(
      `⚠️ *Uso correcto:*\n` +
      `» Responde a un mensaje con *${prefix}* para etiquetar a todos\n` +
      `» O escribe *${prefix} <tu texto>* para enviar un texto mencionando a todos`
    );
  } catch (error) {
    console.error('Error en comando totag:', error);
    await m.reply('❌ Ocurrió un error al ejecutar el comando.');
  }
}

handler.command = ['everyone'];
handler.admin = true;
handler.group = true;

export default handler;
