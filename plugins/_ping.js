const handler = async (m, { conn }) => {
  try {
    const start = Date.now();

    // Respuesta inmediata
    const sentMsg = await conn.sendMessage(m.chat, { text: 'Fetching...' }, { quoted: m });

    // Simulación de delay medido (casi instantáneo)
    const end = Date.now();
    const ping = end - start;

    // Edita el mensaje anterior con el resultado
    await conn.sendMessage(m.chat, {
      text: `${e} *Response:*\n> ${ping}ms`,
      edit: sentMsg.key
    });
  } catch (e) {
    m.reply(`Error en plugin "ping":\n${e.message}`);
  }
};

// Acepta .p, /p, #ping, ping, p, etc.
handler.customPrefix = /^[.!#/\\]?(p|ping)$/i;
handler.command = new RegExp;

export default handler;
