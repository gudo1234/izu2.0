let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`*Uso del comando:*\n${usedPrefix + command} <link de WhatsApp>.`);
  }

  let url = args[0].trim();

  // Busca si el link es de un grupo o un canal
  let groupMatch = url.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{22})/i);
  let channelMatch = url.match(/chat\.whatsapp\.com\/channel\/([0-9A-Za-z]{22,24})/i);

  if (!groupMatch && !channelMatch) {
    return m.reply('❌ Enlace de WhatsApp no reconocido. Asegúrate de que sea un link de un grupo o de un canal.');
  }

  try {
    await conn.sendPresenceUpdate('composing', m.chat);

    if (channelMatch) {
      // Canal
      let code = channelMatch[1];
      let res = await conn.newsletterMetadata("invite", code);
      if (!res) return m.reply('❌ No se encontró información del canal. Puede que el link esté vencido o sea privado.');
      m.reply(`🆔 *ID del Canal:*\n${res.id}`);

    } else if (groupMatch) {
      // Grupo
      let code = groupMatch[1];
      let res = await conn.groupGetInviteInfo(code);
      if (!res) return m.reply('❌ No se encontró información del grupo.');
      m.reply(`🆔 *ID del Grupo:*\n${res.id}`);
    }

  } catch (e) {
    console.error(e);
    m.reply('Error al inspeccionar el link. Puede que esté vencido, privado o que el bot no tenga permiso.');
  }
};

handler.command = ['idchat', 'idcanal', 'idgrupo'];
export default handler;
