let handler = async (m, { conn, text }) => {
  if (!m.isGroup) throw 'Este comando solo funciona en grupos';

  let groupId = m.chat; // ID del grupo actual
  let groupName = (await conn.groupMetadata(groupId)).subject || 'Grupo';

  let messageText = text || 'Hola 😃';

  // Construye el texto con el JID del grupo precedido de @
  // Sin espacio extra entre @ y JID, para que WhatsApp detecte la mención
  let message = `@${groupId} ${messageText}`;

  await conn.sendMessage(groupId, {
    text: message,
    contextInfo: {
      mentionedJid: [groupId]
    }
  }, { quoted: m });
};

handler.command = ['everyone'];
handler.group = true;
handler.admin = true;

export default handler;
