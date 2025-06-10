let handler = async (m, { conn, text }) => {
  if (!m.isGroup) throw 'Este comando solo funciona en grupos';

  let groupId = m.chat;
  let groupMetadata = await conn.groupMetadata(groupId);
  let groupName = groupMetadata.subject || 'Grupo'; // Nombre del grupo

  let messageText = text || 'Hola 😃';

  // Simulación de mención del grupo: formateamos el nombre del grupo para que parezca un tag
  let simulatedMention = `@${groupName}`;

  // Construir el mensaje
  let fullMessage = `${simulatedMention} ${messageText}`;

  // Enviar mensaje con mención falsa al grupo
  await conn.sendMessage(groupId, {
    text: fullMessage,
    contextInfo: {
      mentionedJid: [groupId] // Se pone el JID del grupo para que sea reconocido
    }
  }, { quoted: m });
};

handler.command = ['everyone'];
handler.group = true;
handler.admin = true;

export default handler;
