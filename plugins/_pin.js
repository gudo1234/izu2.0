import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`❌ Usa el comando correctamente:\n${usedPrefix + command} <tema>`);
  }

  await m.react('🔍');

  try {
    const res = await fetch(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status || !json.result || json.result.length === 0) {
      return m.reply('❌ No se encontraron imágenes para ese término.');
    }

    // Selecciona hasta 10 imágenes aleatorias (si hay suficientes)
    const shuffled = json.result.sort(() => 0.5 - Math.random());
    const selectedImages = shuffled.slice(0, 10);

    const mediaArray = selectedImages.map((url) => ({
      image: { url },
      caption: `🔎 Resultado de: *${text}*\n🌐 Fuente: Pinterest`
    }));

    for (const item of mediaArray) {
      await conn.sendMessage(m.chat, item, { quoted: m });
    }

    await m.react('✅');

  } catch (err) {
    console.error(err);
    m.reply('❌ Error al buscar imágenes en Pinterest.');
  }
};

handler.command = ['pinterest', 'pin'];
handler.group = true;

export default handler;
