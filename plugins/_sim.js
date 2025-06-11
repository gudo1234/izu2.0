import fetch from 'node-fetch'

let handler = async (m, { text, command, usedPrefix }) => {
  if (!text) {
    return m.reply(`${e} Escribe algo para preguntarle a ${wm}.\n\n> Ejemplo de uso: \`${usedPrefix+ command}\` hola que tal`);
  }

  const prompt = `${e} Tú actuarás como un bot de whatsapp, te llamarás ${wm}.\n\nEres una inteligencia artificial profesional, confiable y útil, enfocada en ayudar con información precisa y búsqueda de contenido.\n\nSiempre respondes con claridad, empatía y sin exageraciones ni referencias absurdas Lenguaje: Español claro, formal pero cercano.`;
  const url = `https://api.stellarwa.xyz/ai/gptprompt?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent(prompt)}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.status || !json.result) {
      return m.reply(`${e} No se pudo obtener respuesta.`);
    }

    m.reply(json.result);
  } catch (e) {
    console.error(e);
    m.reply(`${e} Ocurrió un error al contactar con la API.`);
  }
};

handler.command = ['simi'];
//handler.group = true;
export default handler;
