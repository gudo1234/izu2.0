import axios from 'axios';
import yts from 'yt-search';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.includes('list=')) {
    return m.reply(`❌ Usa el comando correctamente:\nEjemplo:\n${usedPrefix}${command} https://youtube.com/playlist?list=PLRW7iEDD9RDRv8EQ3AO-CUqmKfEkaYQ2M`);
  }

  await m.react('🔎');

  // 1. Buscar la playlist y obtener videos con yt-search
  let playlistInfo;
  try {
    playlistInfo = await yts({ listId: text.split('list=')[1].split('&')[0] });
  } catch (err) {
    return m.reply('❌ Error al obtener la playlist: ' + err.message);
  }

  const videos = playlistInfo?.videos || [];
  if (videos.length === 0) return m.reply('❌ No se encontraron videos en la playlist.');

  // Limitar a los primeros 10 videos para no saturar (opcional)
  const maxVideos = 10;
  const videosToProcess = videos.slice(0, maxVideos);

  for (const video of videosToProcess) {
    try {
      const videoUrl = video.url;
      const title = video.title;

      // APIs para obtener el audio
      const apis = [
        `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(videoUrl)}`,
        `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}`
      ];

      let downloadUrl = null;

      for (const api of apis) {
        try {
          const res = await axios.get(api);
          if (res.data?.data?.dl) {
            downloadUrl = res.data.data.dl;
            break;
          } else if (res.data?.result?.download?.url) {
            downloadUrl = res.data.result.download.url;
            break;
          }
        } catch {}
      }

      if (!downloadUrl) {
        // saltar video si no hay enlace de descarga
        continue;
      }

      // Enviar audio
      await conn.sendMessage(m.chat, {
        audio: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }, { quoted: m });

      // Pausa entre envíos para evitar saturación
      await new Promise(r => setTimeout(r, 3000));

    } catch {}
  }

  await m.react('✅');
};

handler.command = ['playlist'];
export default handler;
