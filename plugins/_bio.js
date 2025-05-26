const handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Ejemplo:\n${usedPrefix + command} @user Hola | ¿Cómo estás?`);

  const [targetRaw, ...rest] = text.trim().split(/\s+/);
  let message = rest.join(' ').trim();
  if (!message) return m.reply(`Falta el texto. Ejemplo:\n${usedPrefix + command} @user Hola | ¿Cómo estás?`);
  const cleanNumber = targetRaw
    .replace(/[^0-9@]/g, '')
    .replace(/^@/, '');

  let jid;
  if (/^\d{7,15}$/.test(cleanNumber)) {
    jid = cleanNumber + '@s.whatsapp.net';
  } else if (/^\d{7,15}@s\.whatsapp\.net$/.test(cleanNumber)) {
    jid = cleanNumber;
  } else {
    return m.reply('Formato inválido. Usa una mención @user o número válido.');
  }

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

handler.command = ['bio']
handler.owner = true;

export default handler;
