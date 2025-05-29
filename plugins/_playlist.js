import fetch from 'node-fetch';
import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.includes('list=')) {
    return m.reply(`📄 Uso correcto:\n${usedPrefix + command} <enlace de playlist>\n\nEjemplo:\n${usedPrefix + command} https://youtube.com/playlist?list=...`);
  }

  await m.reply('🔍 Obteniendo enlaces de la playlist...');

  try {
    const res = await fetch(text);
    const html = await res.text();

    const jsonData = html.split('var ytInitialData = ')[1]?.split(';</script>')[0];
    if (!jsonData) return m.reply('❌ No se pudo extraer la información de la playlist.');

    const data = JSON.parse(jsonData);

    const videos = [];
    const items = data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content
      ?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.playlistVideoListRenderer?.contents;

    if (!items || !Array.isArray(items)) return m.reply('❌ No se encontraron videos en la playlist.');

    for (const item of items) {
      const videoId = item.playlistVideoRenderer?.videoId;
      if (videoId) {
        videos.push(`https://www.youtube.com/watch?v=${videoId}`);
      }
    }

    const uniqueUrls = [...new Set(videos)];
    if (!uniqueUrls.length) return m.reply('❌ No se encontraron videos en la playlist.');

    await m.reply(`🎶 Se encontraron *${uniqueUrls.length}* canciones. Enviando audios...`);

    for (const url of uniqueUrls) {
      try {
        let info, title = 'audio', durationMin = 0;

        // Intentar primero con siputzx
        try {
          const api1 = await axios.get(`https://api.siputzx.my.id/api/d/ytmp3?url=${url}`);
          if (api1.data?.data?.dl) {
            title = api1.data.data.title || title;
            durationMin = (api1.data.data.duration || 0) / 60;
            var downloadUrl = api1.data.data.dl;
          } else throw new Error();
        } catch {
          const api2 = await axios.get(`https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`);
          if (api2.data?.result?.download?.url) {
            title = api2.data.result.title || title;
            durationMin = (api2.data.result.duration || 0) / 60;
            var downloadUrl = api2.data.result.download.url;
          } else {
            await m.reply(`❌ No se pudo descargar: ${url}`);
            continue;
          }
        }

        const sendAsDoc = durationMin >= 15;

        await conn.sendMessage(m.chat, {
          [sendAsDoc ? 'document' : 'audio']: { url: downloadUrl },
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`,
          ptt: false
        }, { quoted: m });

        await new Promise(r => setTimeout(r, 1500)); // Espera entre audios
      } catch (err) {
        console.error(err);
        await m.reply(`⚠️ Error al procesar un audio:\n${err.message}`);
      }
    }

    await m.reply('✅ ¡Playlist enviada con éxito!');
  } catch (err) {
    console.error(err);
    m.reply(`❌ Ocurrió un error al procesar la playlist:\n${err.message}`);
  }
};

handler.command = ['playlist'];
handler.group = true;
export default handler;
