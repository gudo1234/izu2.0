const handler = async (m, { conn }) => {
  try {
    const start = Date.now();
    const sentMsg = await conn.sendMessage(m.chat, { text: `Fetching...` }, { quoted: m });
    const end = Date.now();
    await conn.sendMessage(m.chat, { text: `*Response:*\n> ${end - start}ms`, edit: sentMsg.key });
  } catch (e) {
    m.reply(`Error en plugin "ping":\n${e.message}`);
  }
}

handler.customPrefix = /^(p|ping)$/i
handler.command = new RegExp
handler.commamd = ['p', 'ping']
export default handler;
