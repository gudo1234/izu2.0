import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {

  if (!text) return m.reply(`${e} _*Por favor, ingresa una pregunta para gestionar conmigo usando la herramienta gémini.*_`);
  m.react('🕒');

  try {
    const prompt = `Responde en español: ${text}`;
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://api.siputzx.my.id/api/ai/gemini-lite?prompt=${encodedPrompt}&model=gemini-2.0-flash-lite`;

    const res = await fetch(url);
    const json = await res.json();

    if (json.status && json.data && json.data.parts) {
      const respuesta = json.data.parts.map(p => p.text).join('\n');
      m.react('✅')
      conn.reply(m.chat, respuesta, m, fake);
    } else {
      m.reply(`${e} No se pudo obtener respuesta de Gemini.`);
    }
  } catch (error) {
    console.error(error);
    m.reply(`${e} Ocurrió un error al consultar Gemini.`);
  }
};

handler.command = ['gemini', 'bot'];
handler.group = true;

export default handler;
