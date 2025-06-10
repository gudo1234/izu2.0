/*let handler = async (m, { conn }) => {
    const start = Date.now()
    await conn.sendMessage(m.chat, {
        react: {
            text: '🏓',
            key: m.key
        }
    })
    const latency = Date.now() - start
    await conn.sendMessage(m.chat, { 
        text: `Tiempo de respuesta: ${latency}ms` 
    }, { quoted: m })
}

handler.command = ['ping', 'p']
export default handler*/

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

handler.command = ['p'];
export default handler;
