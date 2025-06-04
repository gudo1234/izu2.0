let handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`🚩 Ejemplo de uso: *.met hola, cómo estás?*`);

  const meta = '13135550002@s.whatsapp.net';

  await conn.sendMessage(m.chat, {
    text: `@${meta.split('@')[0]} ${text}`,
    mentions: [meta],
  }, { quoted: m });
};

handler.command = ['met'];
handler.group = true;
export default handler;
