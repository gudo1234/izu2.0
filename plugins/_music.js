import fetch from 'node-fetch';

const handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`⚠️ Ingresa una pregunta. Ejemplo:\n\n${usedPrefix + command} ¿Qué es la inteligencia artificial?`);
  }

  const texto = encodeURIComponent(args.join(' '));
  const url = `http://optishield.zapto.org:38566/api/?type=gemini&text=${texto}`;

  try {
    const res = await fetch(url);
    const raw = await res.text();

    // 🔧 Corregimos el formato para convertirlo en JSON válido
    const fixedRaw = raw
      .replace(/(\w+):/g, '"$1":') // Comillas a claves
      .replace(/'/g, '"');         // Comillas simples a dobles

    const data = JSON.parse(fixedRaw);

    if (!data.text) throw '❌ No se recibió una respuesta válida.';
    await m.reply(data.text.trim());

  } catch (e) {
    console.error('[❌ ERROR GEMINI]', e);
    m.reply('❌ No se recibió respuesta válida de Gemini.');
  }
};

handler.command = ['mierd'];
handler.help = ['gemini <texto>'];
handler.tags = ['ai'];
export default handler;
