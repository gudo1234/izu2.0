const handler = async (m, { conn }) => {
  try {
    let chats = Object.entries(conn.chats)
      .filter(([jid]) => jid.endsWith('@s.whatsapp.net'));

    if (!chats.length) return m.reply('📭 No hay chats privados disponibles.');

    let texto = '🧾 *Últimos mensajes privados:*\n\n';

    for (let [jid, data] of chats) {
      let name = await conn.getName(jid);
      let lastMsg;

      try {
        const msgs = data.messages ? [...data.messages.values()] : [];
        if (msgs.length === 0) continue;

        lastMsg = msgs[msgs.length - 1];
        if (!lastMsg || !lastMsg.message) continue;
      } catch {
        continue;
      }

      const content = getTextFromMessage(lastMsg.message);
      const timestamp = new Date((lastMsg.messageTimestamp || Date.now()) * 1000).toLocaleTimeString('es-AR', {
        hour: '2-digit', minute: '2-digit'
      });

      texto += `👤 *${name}*\n"${content}" • ${timestamp}\n\n`;
    }

    if (texto.trim() === '🧾 *Últimos mensajes privados:*') {
      return m.reply('📭 No se encontraron mensajes recientes en chats privados.');
    }

    await m.reply(texto.trim());
  } catch (e) {
    console.error(e);
    await m.reply('❌ Hubo un error al obtener los mensajes privados.');
  }
};

function getTextFromMessage(msg) {
  if (msg.conversation) return msg.conversation;
  if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
  if (msg.imageMessage?.caption) return msg.imageMessage.caption;
  if (msg.videoMessage?.caption) return msg.videoMessage.caption;
  if (msg.buttonsResponseMessage?.selectedButtonId) return msg.buttonsResponseMessage.selectedButtonId;
  if (msg.listResponseMessage?.title) return msg.listResponseMessage.title;
  return '[sin texto]';
}

handler.command = ['chats'];
export default handler;
