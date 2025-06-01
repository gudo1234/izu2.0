import Starlights from '@StarlightsTeam/Scraper';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `✎ Usa el comando correctamente:\n\n📌 Ejemplo:\n*${usedPrefix + command}* La Vaca Lola`, m);
  }

  await m.react('🔍');

  try {
    const isUrl = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/i.test(text);
    if (isUrl) {
      return conn.reply(m.chat, '✗ Este comando solo funciona con búsquedas por texto, no enlaces.', m);
    }

    // Ejecutar búsqueda
    const searchData = await Starlights.tiktoksearch(text);
    const videos = Array.isArray(searchData) ? searchData : searchData?.result || searchData?.data || [];

    if (!videos || videos.length === 0) {
      return conn.reply(m.chat, '✗ No se encontraron resultados para esa búsqueda.', m);
    }

    // Filtrar videos válidos con URL
    const validVideos = videos.filter(v => v.video && v.video.startsWith('http'));

    if (validVideos.length === 0) {
      return conn.reply(m.chat, '✗ No se encontraron videos válidos para mostrar.', m);
    }

    const selected = validVideos.sort(() => Math.random() - 0.5).slice(0, 20);

    await conn.sendMessage(m.chat, {
      video: { url: selected[0].video },
      caption: '*Se muestran 20 resultados*'
    }, { quoted: m });

    for (let i = 1; i < selected.length; i++) {
      await conn.sendMessage(m.chat, {
        video: { url: selected[i].video }
      }, { quoted: m });
    }

    await m.react('✅');

  } catch (e) {
    console.error('[ERROR EN TIKTOKSEARCH]', e);
    conn.reply(m.chat, '✗ Error al buscar videos en TikTok.', m);
  }
};

handler.command = ['edi'];
handler.group = true;

export default handler;
