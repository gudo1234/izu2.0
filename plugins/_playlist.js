import axios from 'axios';
import yts from 'yt-search';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.includes('list=')) {
    return m.reply(`❌ Usa el comando correctamente:\nEjemplo:\n${usedPrefix}${command} https://youtube.com/playlist?list=PLRW7iEDD9RDRv8EQ3AO-CUqmKfEkaYQ2M`);
  }

  await m.react('🔎');

  let playlistInfo;
  try {
    playlistInfo = await yts({ listId: text.split('list=')[1].split('&')[0] });
    console.log('Playlist info:', playlistInfo);
  } catch (err) {
    console.log('Error obteniendo playlist:', err);
    return m.reply('❌ Error al obtener la playlist: ' + err.message);
  }

  const videos = playlistInfo?.videos || [];
  if (videos.length === 0) {
    console.log('No se encontraron videos en la playlist');
    return m.reply('❌ No se encontraron videos en la playlist.');
  }

  const maxVideos = 10;
  const videosToProcess = videos.slice(0, maxVideos);

  let sentCount = 0;

  for (const video of videosToProcess) {
    try {
      const videoUrl = video.url;
      const title = video.title;

      console.log(`Procesando video: ${title} - ${videoUrl}`);

      const apis = [
        `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(videoUrl)}`,
        `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}`
      ];

      let downloadUrl = null;

      for (const api of apis) {
        try {
          console.log(`Probando API: ${api}`);
          const res = await axios.get(api);
          console.log(`Respuesta API:`, res.data);

          if (res.data?.data?.dl) {
            downloadUrl = res.data.data.dl;
            console.log(`URL de descarga encontrada (siputzx): ${downloadUrl}`);
            break;
          } else if (res.data?.result?.download?.url) {
            downloadUrl = res.data.result.download.url;
            console.log(`URL de descarga encontrada (vreden): ${downloadUrl}`);
            break;
          } else {
            console.log('No se encontró URL válida en esta API');
          }
        } catch (e) {
          console.log(`Error con API ${api}: ${e.message}`);
        }
      }

      if (!downloadUrl) {
        console.log(`No se encontró URL de descarga para: ${title}`);
        continue;
      }

      await conn.sendMessage(m.chat, {
        audio: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }, { quoted: m });

      sentCount++;
      await new Promise(r => setTimeout(r, 3000));
    } catch (e) {
      console.log(`Error enviando audio: ${e.message}`);
    }
  }

  await m.react('✅');

  if (sentCount === 0) {
    return m.reply('❌ No se pudo enviar ningún audio de la playlist.');
  }
};

handler.command = ['playlist'];
export default handler;
