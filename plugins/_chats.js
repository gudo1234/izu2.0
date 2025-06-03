const handler = async (m, { conn }) => {
  try {
    const chatsMap = conn.chats || new Map();
    const chatList = [];

    for (const [jid, chat] of chatsMap.entries()) {
      const messages = chat.messages ? [...chat.messages.values()] : [];
      const receivedMessages = messages.filter(msg =>
        !msg.key?.fromMe &&
        (msg.message?.conversation || msg.message?.extendedTextMessage?.text)
      );

      if (!receivedMessages.length) continue;

      const lastMessages = receivedMessages
        .slice(-3)
        .map(msg => msg.message.conversation || msg.message.extendedTextMessage?.text || '[Mensaje no texto]');

      chatList.push({
        jid,
        count: receivedMessages.length,
        lastMessages
      });
    }

    if (!chatList.length) return m.reply('❌ No se encontraron chats con mensajes recibidos.');

    chatList.sort((a, b) => b.count - a.count);
    const limitedList = chatList.slice(0, 20);

    let response = `📨 *Se muestran ${limitedList.length} chats recientes:*\n\n`;

    for (let i = 0; i < limitedList.length; i++) {
      const { jid, count, lastMessages } = limitedList[i];
      const number = jid.replace(/@.+/, '');
      const preview = lastMessages.map(t => `- ${t}`).join('\n');
      response += `*#${i + 1}*\n📱 (${number})\n📨 *Mensajes recibidos:* ${count}\n🗒️ *Últimos mensajes:*\n${preview}\n\n`;
    }

    m.reply(response.trim());
  } catch (e) {
    console.error('[ERROR EN COMANDO /chats]', e);
    m.reply('❌ Error al obtener los chats. Asegúrate de que el bot tenga mensajes recientes.');
  }
};

handler.help = ['chats'];
handler.command = ['chats'];
handler.owner = true; // Solo para el dueño del bot, puedes quitar si quieres permitirlo a todos
export default handler;
