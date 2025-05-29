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
  } catch (err) {
    return m.reply('❌ Error al obtener la playlist: ' + err.message);
  }

  const videos = playlistInfo?.videos || [];
  if (videos.length === 0) return m.reply('❌ No se encontraron videos en la playlist.');

  // Limitar a los primeros 10 para evitar saturar
  const maxVideos = 10;
  const videosToProcess = videos.slice(0, maxVideos);

  let sentCount = 0;

  for (const video of videosToProcess) {
    try {
      const videoUrl = video.url;
      const title = video.title;

      console.log(`Procesando video: ${title} - ${videoUrl}`);

      // APIs para obtener audio
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
        } catch (e) {
          console.log(`Error con API ${api}: ${e.message}`);
        }
      }

      if (!downloadUrl) {
        console.log(`No se encontró URL de descarga para: ${title}`);
        continue; // salta a siguiente video
      }

      await conn.sendMessage(m.chat, {
        audio: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }, { quoted: m });

      sentCount++;
      // Pausa 3s para evitar bloqueo
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
