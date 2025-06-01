import Starlights from '@StarlightsTeam/Scraper';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `✎ Usa el comando correctamente:\n\n📌 Ejemplo:\n*${usedPrefix + command}* La Vaca Lola`, m);
  }

  await m.react('🔍');

  try {
    // Solo permite búsquedas por texto
    const isUrl = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/i.test(text);
    if (isUrl) {
      return conn.reply(m.chat, '✗ Este comando solo funciona con búsquedas por texto, no enlaces.', m);
    }

    // Buscar videos por texto
    const results = await Starlights.tiktoksearch(text);
    if (!results || results.length === 0) {
      return conn.reply(m.chat, '✗ No se encontraron resultados.', m);
    }

    // Seleccionar 20 resultados aleatorios
    const shuffled = results.sort(() => Math.random() - 0.5).slice(0, 20);

    // Mostrar mensaje en el primero
    await conn.sendMessage(m.chat, {
      video: { url: shuffled[0].video },
      caption: '*Se muestran 20 resultados*'
    }, { quoted: m });

    // Enviar los 19 restantes sin caption
    for (let i = 1; i < shuffled.length; i++) {
      await conn.sendMessage(m.chat, {
        video: { url: shuffled[i].video }
      }, { quoted: m });
    }

    await m.react('✅');

  } catch (e) {
    console.error('[ERROR]', e);
    conn.reply(m.chat, '✗ Error al buscar videos en TikTok.', m);
  }
};

// Solo para .tiktoksearch
handler.command = ['ed'];
handler.group = true;

export default handler;
