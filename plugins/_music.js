import fetch from 'node-fetch';

const handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`✳️ Usa el comando así:\n${usedPrefix + command} Hola`);
  }

  const texto = args.join(' ');
  const user = m.sender.split('@')[0];
  const url = `http://optishield.zapto.org:38566/api/?type=gemini&user=${encodeURIComponent(user)}&text=${encodeURIComponent(texto)}`;

  try {
    const res = await fetch(url);
    const raw = await res.text();

    // Convertir texto crudo a objeto
    const data = Function('"use strict";return (' + raw + ')')();

    if (!data.text) throw new Error('Respuesta inválida');

    await m.reply(data.text.trim());
  } catch (e) {
    console.error(e);
    m.reply('❌ No se recibió respuesta válida de Gemini.');
  }
};

handler.help = ['gemini <texto>'];
handler.tags = ['ai'];
handler.command = ['mierd'];
//handler.register = true;

export default handler;
