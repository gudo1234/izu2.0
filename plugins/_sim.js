import fetch from 'node-fetch';

let handler = async (m, { text, command }) => {
  if (!text) {
    return m.reply(`${e} Escribe algo para preguntarle a Edar.\n\nUso: .${command} <texto>`);
  }

  const prompt = 'tú actuarás como un bot de whatsapp, te llamarás Edar';
  const url = `https://api.stellarwa.xyz/ai/gptprompt?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent(prompt)}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.status || !json.result) {
      return m.reply('❌ No se pudo obtener respuesta de Edar.');
    }

    m.reply(json.result);
  } catch (e) {
    console.error(e);
    m.reply('⚠️ Ocurrió un error al contactar con la API.');
  }
};

handler.command = ['simi'];
//handler.group = true;
export default handler;
