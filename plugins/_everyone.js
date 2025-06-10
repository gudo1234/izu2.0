let handler = async (m, { conn, groupMetadata, text, isAdmin, isOwner }) => {
  if (!m.isGroup) throw 'Este comando solo funciona en grupos';
  if (!isAdmin && !isOwner) throw 'Solo los admins pueden usar este comando';

  const groupId = m.chat; // el JID del grupo, ej: 1203633xxxx@g.us
  const groupName = groupMetadata.subject;
  const msg = text || 'Hola 😃';

  // Enviamos un mensaje crudo con tipo "groupMentionedMessage"
  await conn.relayMessage(m.chat, {
    groupMentionedMessage: {
      mentionedJid: [groupId], // mención al grupo mismo
      text: `@${groupName} ${msg}` // se ve en azul
    }
  }, { messageId: m.key.id });
};

handler.command = ['everyone']
handler.group = true;
handler.admin = true;

export default handler;
