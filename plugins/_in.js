let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(` *Uso del comando:*\n${usedPrefix + command} https://chat.whatsapp.com/xxxxxxxxxxxxxxxx o un link de canal.`);
  }

  let url = args[0].trim();

  // Detectamos si es un link de grupo
  let match = url.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i);
  
  // Detectamos si es un link de canal
  let matchChannel = url.match(/whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i);

  if (!match && !matchChannel) {
    return m.reply('❌ Enlace inválido. Asegúrate de que sea un link de WhatsApp válido.');
  }

  try {
    await conn.sendPresenceUpdate('composing', m.chat);

    if (match) {
      // Grupo
      let code = match[1];
      let res = await conn.groupGetInviteInfo(code);

      if (!res) throw 'No se pudo obtener la información del grupo. Puede que el link haya expirado.';

      let groupInfo = `😃 *Nombre del grupo:* ${res.subject}
🆔 *ID:* ${res.id}
👑 *Owner:* ${res.owner ? '@' + res.owner.split('@')[0] : 'Desconocido'}
👥 *Participantes:* ${res.size}
📝 *Descripción:* ${res.desc?.toString().trim() || 'Sin descripción'}
⏰ *Creado:* ${res.creation ? new Date(res.creation * 1000).toLocaleString() : 'N/D'}
🔒 *Restricciones:* ${res.restrict ? '✔️' : '❌'}
🔕 *Solo admins pueden escribir:* ${res.announce ? '✔️' : '❌'}
🌐 *Enlace válido:* ${url}
`.trim();

      m.reply(groupInfo, null, {
        mentions: res.owner ? [res.owner] : []
      });

    } else if (matchChannel) {
      // Canal
      let code = matchChannel[1];
      let res = await conn.newsletterMetadata("invite", code);

      if (!res) return m.reply('*No se encontró información del canal.*');

      let caption = "*Inspector de enlaces de Canal*\n\n" + processObject(res, "", res?.preview);
      let pp = res?.preview ? getUrlFromDirectPath(res.preview) : '';
      await conn.sendMessage(m.chat, {
        text: caption,
        contextInfo: {
          externalAdReply: {
            title: "📢 Inspector de Canales",
            body: "Información del Canal",
            thumbnailUrl: pp,
            mediaType: 1,
            renderLargerThumbnail: false,
            showAdAttribution: false,
            sourceUrl: url
          }
        }
      }, { quoted: m });

      if (res.id) {
        conn.sendMessage(m.chat, { text: res.id }, { quoted: m });
      }
    }
  } catch (e) {
    console.error(e);
    m.reply('Error al inspeccionar el chat. Puede que el link haya expirado o que no tengas permiso para inspeccionarlo.');
  }
};

handler.command = ['in'];
export default handler;
