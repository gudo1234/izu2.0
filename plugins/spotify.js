import axios from 'axios';
import yts from 'yt-search';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`${e} Usa el comando así:\n${usedPrefix + command} diles`);

  await m.react('🕒');

  try {
    // 1. Buscar en API Velyn Spotify
    const searchUrl = `https://velyn.biz.id/api/search/spotify?query=${encodeURIComponent(text)}`;
    const { data: spotifyRes } = await axios.get(searchUrl);

    if (!spotifyRes.status || !spotifyRes.data.length) {
      return m.reply(`${e} No se encontró ninguna canción en Spotify para: ${text}`);
    }

    // Tomamos la primer canción
    const song = spotifyRes.data[0];
    const { name, artists, duration_ms, link: spotifyLink, image } = song;

    // 2. Buscar en YouTube usando el título y artista para mejor precisión
    const ytQuery = `${name} ${artists}`;
    const ytSearchRes = await yts(ytQuery);

    if (!ytSearchRes.videos.length) {
      return m.reply(`${e} No se encontró la canción en YouTube para descargar: ${ytQuery}`);
    }

    const ytVideo = ytSearchRes.videos[0];
    const ytUrl = ytVideo.url;

    // 3. Usar API Siputzx para obtener link de descarga mp3 de YouTube
    const downloadApiUrl = `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(ytUrl)}`;
    const { data: downloadRes } = await axios.get(downloadApiUrl);

    if (!downloadRes?.data?.dl) {
      return m.reply(`${e} No se pudo obtener el enlace de descarga de la canción.`);
    }

    const audioUrl = downloadRes.data.dl;

    // 4. Preparar texto de info y enviar
    const durationSec = Math.floor(duration_ms / 1000);
    const minutes = Math.floor(durationSec / 60);
    const seconds = durationSec % 60;

    const caption = `
🎵 *Spotify:* ${name}
👤 *Artista(s):* ${artists}
⏳ *Duración:* ${minutes}:${seconds.toString().padStart(2, '0')}
🔗 *Spotify Link:* ${spotifyLink}
🔎 *YouTube:* ${ytUrl}
`.trim();

    await conn.sendMessage(m.chat, { image: { url: image }, caption }, { quoted: m });

    // 5. Enviar audio
    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${name} - ${artists}.mp3`
    }, { quoted: m });

    await m.react('✅');

  } catch (e) {
    console.error(e);
    m.reply(`${e} Ocurrió un error inesperado al procesar tu solicitud.`);
  }
};

handler.command = ['spotify', 'spotdl'];
handler.group = true;

export default handler;
