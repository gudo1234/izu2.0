const handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`Ejemplo:\n.bio @user Hola | ¿Cómo estás?`);

  const [rawTarget, ...rest] = text.trim().split(/\s+/);
  const message = rest.join(' ').trim();
  if (!message) return m.reply(`Falta el texto. Ejemplo:\n.bio @user Hola | ¿Cómo estás?`);

  // Limpiar el número
  let clean = rawTarget.replace(/[^0-9]/g, ''); // Quita todo menos números

  if (clean.length < 7 || clean.length > 15) return m.reply('Número inválido o mal formateado.');

  const jid = clean + '@s.whatsapp.net';

  // Separar mensajes si hay "|"
  const [msg1, msg2] = message.split('|').map(v => v.trim()).filter(Boolean);

  try {
    if (msg1) await conn.reply(jid, msg1, null, { contextInfo: { mentionedJid: [m.sender] } });
    if (msg2) await conn.reply(jid, msg2, null, { contextInfo: { mentionedJid: [m.sender] } });
    m.reply('Mensaje enviado correctamente.');
  } catch (e) {
    console.error(e);
    m.reply('Ocurrió un error al enviar el mensaje.');
  }
};

handler.command = ['bio'];
handler.owner = true;

export default handler;
