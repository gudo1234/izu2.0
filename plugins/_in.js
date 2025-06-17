let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(` *Uso del comando:*\n${usedPrefix + command} https://chat.whatsapp.com/channel/xxxxxxxxxxxxxxxx`);
  }

  let url = args[0].trim();
  let match = url.match(/chat\.whatsapp\.com\/channel\/([0-9A-Za-z]{22,24})/i);
  if (!match) return m.reply('❌ Enlace de canal inválido. Asegúrate de que sea un link de canal de WhatsApp.");

  let code = match[1];
  try {
    await conn.sendPresenceUpdate('composing', m.chat);
    let res = await conn.newsletterMetadata("invite", code);

    if (!res) return m.reply('❌ No se encontró información del canal. Puede que el link esté vencido o sea privado.');

    m.reply(`🆔 *ID del Canal:*\n${res.id}`);

  } catch (e) {
    console.error(e);
    m.reply('Error al inspeccionar el canal. Es posible que el enlace haya expirado o que el bot no tenga permisos.');
  }
};

handler.command = ['idcanal'];
export default handler;
