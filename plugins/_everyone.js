let handler = async (m, { conn, groupMetadata, text }) => {
  if (!m.isGroup) throw 'Este comando solo funciona en grupos';

  const groupName = groupMetadata.subject || 'Grupo';
  const message = text || 'Hola a todos 👋';

  // Mencionamos a todos los participantes para que WhatsApp ponga el texto en azul
  const mentions = groupMetadata.participants.map(p => p.id);

  // El texto con la “etiqueta” @nombre del grupo al inicio
  const textToSend = `@${groupName} ${message}`;

  await conn.sendMessage(m.chat, {
    text: textToSend,
    mentions
  }, { quoted: m });
};

handler.command = ['everyone']
handler.group = true;
handler.admin = true;

export default handler;
