let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(` *Uso del comando:*\n${usedPrefix + command} https://chat.whatsapp.com/xxxxxxxxxxxxxxxx`);
  }

  let url = args[0].trim();
  let match = url.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i);
  if (!match) return m.reply('❌ Enlace inválido. Asegúrate de que sea un link de grupo de WhatsApp válido.');

  let code = match[1];
  try {
    await conn.sendPresenceUpdate('composing', m.chat);
    let res = await conn.groupGetInviteInfo(code);

    if (!res) throw 'No se pudo obtener la información del grupo.';
    let groupInfo = `😃 *Nombre del grupo:* ${res.subject}
🆔 *ID:* ${res.id}
👑 *Owner:* ${res.owner ? '@' + res.owner.split('@')[0] : 'Desconocido'}
👥 *Participantes:* ${res.size}
📝 *Descripción:* ${res.desc?.toString().trim() || 'Sin descripción'}
⏰ *Creado:* ${res.creation ? new Date(res.creation * 1000).toLocaleString() : 'N/D'}
🔒 *Restricciones:* ${res.restrict ? '✔️' : '❌'}
🔕 *Solo admins pueden editar info:* ${res.announce ? '✔️' : '❌'}
🌐 *Enlace válido:* ${url}
`.trim();

    m.reply(groupInfo, null, {
      mentions: res.owner ? [res.owner] : []
    });

  } catch (e) {
    console.error(e);
    m.reply('Error al inspeccionar el grupo. Es posible que el enlace haya expirado o que no tengas permisos para inspeccionarlo.');
  }
};

handler.command = ['in'];
export default handler;
