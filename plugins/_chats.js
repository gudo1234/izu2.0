const handler = async (m, { conn }) => {
  try {
    const chats = conn.chats ? [...conn.chats.entries()] : [];

    const chatList = [];

    for (const [jid, chatData] of chats) {
      const messages = chatData.messages ? [...chatData.messages.values()] : [];

      const receivedMessages = messages.filter(msg =>
        !msg.key.fromMe &&
        msg.message &&
        (msg.message.conversation || msg.message.extendedTextMessage?.text)
      );

      if (receivedMessages.length === 0) continue;

      const lastMessages = receivedMessages
        .slice(-3)
        .map(msg => {
          return msg.message.conversation || msg.message.extendedTextMessage?.text || '[Otro tipo de mensaje]';
        });

      chatList.push({
        jid,
        count: receivedMessages.length,
        lastMessages
      });
    }

    if (!chatList.length) return m.reply('❌ No se encontraron chats recientes con mensajes recibidos.');

    chatList.sort((a, b) => b.count - a.count);
    const limitedList = chatList.slice(0, 20);

    let text = `📨 *Se muestran ${limitedList.length} chats recientes:*\n\n`;

    for (let i = 0; i < limitedList.length; i++) {
      const { jid, count, lastMessages } = limitedList[i];
      const number = jid.split('@')[0];
      const preview = lastMessages.map(m => `- ${m}`).join('\n');

      text += `*#${i + 1}*\n📱 (${number})\n📨 *Cantidad de mensajes:* ${count}\n📬 *Mensajes recibidos:*\n${preview}\n\n`;
    }

    m.reply(text.trim());
  } catch (e) {
    console.error('❌ Error en el handler de /chats:', e);
    m.reply('❌ Ocurrió un error al obtener los chats.');
  }
};

handler.help = ['chats'];
handler.command = ['chats'];
handler.owner = true;

export default handler;
