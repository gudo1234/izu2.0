let handler = async (m, { conn, text }) => {
  if (!m.isGroup) throw 'Este comando solo funciona en grupos';

  let groupId = m.chat;
  let groupMetadata = await conn.groupMetadata(groupId);
  let participants = groupMetadata.participants.map(p => p.id); // array de JIDs

  let messageText = text || 'Hola 😃';

  // Construir texto con @usuario para cada participante, separados por espacio
  // WhatsApp detecta automáticamente las menciones en base a mentionedJid
  let mentionsText = participants.map(jid => `@${jid.split('@')[0]}`).join(' ');

  // Texto final: las menciones en azul + el mensaje
  let fullText = `${mentionsText}\n\n${messageText}`;

  await conn.sendMessage(groupId, {
    text: fullText,
    contextInfo: { mentionedJid: participants }
  }, { quoted: m });
};

handler.command = ['everyone'];
handler.group = true;
handler.admin = true;

export default handler;
