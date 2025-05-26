const handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Ejemplo de uso:\n${usedPrefix + command} @user Hola | ¿Cómo estás?`);

  // Separar número o mención del mensaje
  const [target, ...rest] = text.trim().split(/\s+/);
  let message = rest.join(' ').trim();

  if (!message) return m.reply(`Falta el texto. Ejemplo:\n${usedPrefix + command} @user Hola | ¿Cómo estás?`);

  // Procesar segundo mensaje si existe con el separador "|"
  const [msg1, msg2] = message.split('|').map(v => v.trim()).filter(Boolean);

  // Detectar JID destino
  let jid;
  if (target.startsWith('@')) {
    jid = target.replace('@', '') + '@s.whatsapp.net';
  } else if (/^\d{7,15}$/.test(target)) {
    jid = target + '@s.whatsapp.net';
  } else {
    return m.reply('Formato inválido. Usa un número o mención (@user).');
  }

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
