const handler = async (m, { conn }) => {
  try {
    const start = Date.now();
    const sentMsg = await conn.sendMessage(m.chat, { text: 'Fetching...' }, { quoted: m });
    const end = Date.now();
    await conn.sendMessage(m.chat, { text: `Response:\n> ${end - start}ms`, edit: sentMsg.key });
  } catch (e) {
    m.reply(`Error en plugin "ping":\n${e.message}`);
  }
};

// ✅ Responde a: .p, p, .ping, ping
// 🚫 Sin usar (), $, ni i
handler.customPrefix = /^\.p|^p|^\.ping|^ping/;
handler.command = new RegExp;
export default handler;
