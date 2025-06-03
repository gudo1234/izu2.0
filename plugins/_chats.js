const handler = async (m, { conn }) => {
  try {
    const chats = [...conn.chats.values()]
      .filter(c => c.messages && c.messages.size)
      .map(c => {
        const msgs = [...c.messages.values()].filter(msg => msg.key.fromMe === false && msg.message?.conversation);
        return {
          id: c.id,
          messages: msgs,
        };
      })
      .filter(c => c.messages.length > 0)
      .sort((a, b) => b.messages.at(-1).messageTimestamp - a.messages.at(-1).messageTimestamp)
      .slice(0, 20);

    if (!chats.length) return m.reply('❌ No se encontraron chats recientes.');

    let text = `📨 *Se muestran ${chats.length} chats recientes:*\n\n`;

    for (let i = 0; i < chats.length; i++) {
      const chat = chats[i];
      const jid = chat.id;
      const userJid = jid.split('@')[0];
      const messageCount = chat.messages.length;
      const recentMsgs = chat.messages.slice(-3).map(msg => `- ${msg.message.conversation}`).join('\n') || '- (sin mensajes de texto)';

      text += `*#${i + 1}*\n📱 (${userJid})\n📨 *Cantidad de mensajes:* ${messageCount}\n📬 *Mensajes recibidos:*\n${recentMsgs}\n\n`;
    }

    m.reply(text.trim());
  } catch (e) {
    console.error(e);
    m.reply('❌ Ocurrió un error al obtener los chats.');
  }
};

handler.command = ['chats'];
handler.owner = true;

export default handler;
