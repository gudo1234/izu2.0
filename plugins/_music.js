import fetch from 'node-fetch';

const handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`${e} Usa el comando así:\n${usedPrefix + command} Hola`);
  }

  const texto = args.join(' ');
  const user = m.sender.split('@')[0]; // o reemplazar por un nombre fijo

  const url = `http://optishield.zapto.org:38566/api/?type=gemini&user=${encodeURIComponent(user)}&text=${encodeURIComponent(texto)}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    m.reply(json.text || '❌ No se recibió respuesta de Gemini.');
  } catch (e) {
    console.error(e);
    m.reply(`${e} Ocurrió un error al conectar con Gemini.`);
  }
};

handler.command = ['gptgemini', 'mierd']; // puedes usar varios comandos
handler.group = true;

export default handler;
