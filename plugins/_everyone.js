let handler = async (m, { conn, text, participants, command, groupMetadata }) => {
  try {
    const users = participants
      .map(u => u.id)
      .filter(v => v !== conn.user.jid);

    if (m.quoted) {
      // Reenviar mensaje citado con menciones a todos
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
      // Enviar texto con menciones a todos
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

    // Si no hay texto ni mensaje citado, solo manda las menciones vacías
    return conn.sendMessage(m.chat, {
      text: '‎', // Caracter invisible para que no quede vacío del todo
      mentions: users,
      contextInfo: {
        mentionedJid: users,
        groupMentions: [{
          groupJid: m.chat,
          groupSubject: groupMetadata?.subject || ''
        }]
      }
    });
  } catch (error) {
    console.error('Error en comando totag:', error);
    await m.reply('❌ Ocurrió un error al ejecutar el comando.');
  }
}

handler.command = ['everyone'];
handler.admin = true;
handler.group = true;

export default handler;
