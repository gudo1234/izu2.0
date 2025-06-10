let handler = async (m, { conn, text }) => {
  if (!m.isGroup) throw 'Este comando solo funciona en grupos';

  let groupId = m.chat; // id del grupo actual
  let groupName = (await conn.groupMetadata(groupId)).subject || 'Grupo';

  let messageText = text || 'Hola 😃';

  // Construimos el texto con @ y el JID del grupo (comunidad)
  // El formato es: '@' + JID de grupo + ' ' + texto
  // Ejemplo: '@120363305511199754@g.us Hola 😃'

  let message = `@${groupId} ${messageText}`;

  await conn.sendMessage(groupId, {
    text: message,
    contextInfo: {
      mentionedJid: [groupId],
      groupJid: groupId,          // Esto es clave para la mención de comunidad
      externalAdReply: {
        title: groupName,
        showAdAttribution: true,
      }
    }
  }, { quoted: m });
};

handler.command = ['everyone']
handler.group = true;
handler.admin = true;

export default handler;
