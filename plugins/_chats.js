const handler = async (m, { conn }) => {
  try {
    let chats = Object.entries(conn.chats)
      .filter(([jid, chat]) => jid.endsWith('@s.whatsapp.net')) // solo usuarios (no grupos)
      .filter(([jid, chat]) => chat?.messages && chat.messages.size > 0);

    if (chats.length === 0) {
      return m.reply('📭 No hay chats privados con mensajes recientes.');
    }

    let text = '🧾 *Últimos mensajes de usuarios:*\n\n';

    for (let [jid, chat] of chats) {
      // Obtener último mensaje
      let lastMsg = [...chat.messages.values()].pop();
      if (!lastMsg?.message) continue;

      let from = jid.split('@')[0];
      let msgText = getTextFromMessage(lastMsg.message);
      let time = new Date(lastMsg.messageTimestamp * 1000).toLocaleTimeString('es-AR', {
        hour: '2-digit', minute: '2-digit'
      });

      text += `👤 *${from}*\n"${msgText}" • ${time}\n\n`;
    }

    await m.reply(text.trim());
  } catch (e) {
    console.error(e);
    await m.reply('❌ Error al obtener los chats recientes.');
  }
};

// Función auxiliar para extraer texto del mensaje
function getTextFromMessage(msg) {
  if (msg.conversation) return msg.conversation;
  if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
  if (msg.imageMessage?.caption) return msg.imageMessage.caption;
  if (msg.videoMessage?.caption) return msg.videoMessage.caption;
  return '[mensaje no textual]';
}

handler.command = ['chats']
handler.group = true;

export default handler;
