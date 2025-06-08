import fetch from 'node-fetch';

const handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`✳️ Usa el comando así:\n${usedPrefix + command} Hola`);
  }

  const texto = args.join(' ');
  const user = m.sender.split('@')[0]; // se puede personalizar

  const url = `http://optishield.zapto.org:38566/api/?type=gemini&user=${encodeURIComponent(user)}&text=${encodeURIComponent(texto)}`;

  try {
    const res = await fetch(url);
    const data = await res.text(); // obtenemos texto crudo para inspección

    // Mostramos el texto recibido para depurar
    console.log('RESPUESTA CRUDA:', data);

    let json;
    try {
      json = JSON.parse(data);
    } catch (err) {
      return m.reply(`⚠️ Error al analizar la respuesta:\n${data}`);
    }

    if (!json.text) {
      return m.reply('❌ No se recibió respuesta válida de Gemini.');
    }

    m.reply(json.text.trim());
  } catch (e) {
    console.error(e);
    m.reply('⚠️ Error al conectar con Gemini.');
  }
};

handler.help = ['gemini <texto>'];
handler.tags = ['ai'];
handler.command = ['mierd'];
//handler.register = true;

export default handler;
