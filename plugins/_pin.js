import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`❌ Usa el comando así:\n${usedPrefix + command} <tema>`);
  }

  await m.react('🔍');

  try {
    // Llamada a la API de Pinterest
    const res = await fetch(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status || !json.result || json.result.length === 0) {
      return m.reply('❌ No se encontraron imágenes para ese término.');
    }

    // Selecciona una imagen aleatoria del array
    const img = json.result[Math.floor(Math.random() * json.result.length)];

    await conn.sendMessage(m.chat, {
      image: { url: img },
      caption: `🔎 Resultado de: *${text}*\n🌐 Fuente: Pinterest`
    }, { quoted: m });

    await m.react('✅');

  } catch (e) {
    console.error(e);
    m.reply('❌ Error al buscar imágenes en Pinterest.');
  }
};

handler.command = ['pinterest', 'pin'];
handler.group = true;

export default handler;
