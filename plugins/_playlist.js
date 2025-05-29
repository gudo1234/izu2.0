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

    const videoUrlRegex = /\/watch\?v=([a-zA-Z0-9_-]{11})&list=([a-zA-Z0-9_-]+)/g;
    const matches = [...html.matchAll(videoUrlRegex)];

    const urls = [...new Set(matches.map(match => 'https://www.youtube.com/watch?v=' + match[1]))];

    if (!urls.length) return m.reply('❌ No se encontraron videos en la playlist.');

    await m.reply(`🎶 Se encontraron *${urls.length}* canciones. Enviando audios...`);

    for (const url of urls) {
      try {
        // Obtener info del video
        const info = await axios.get(`https://yt.elchicodev.com/api/info?url=${url}`);
        const { title, duration } = info.data || {};
        const durationMin = (duration || 0) / 60;

        // Obtener URL de descarga
        let downloadUrl;
        try {
          const api1 = await axios.get(`https://api.siputzx.my.id/api/d/ytmp3?url=${url}`);
          if (api1.data?.data?.dl) {
            downloadUrl = api1.data.data.dl;
          } else throw new Error();
        } catch {
          try {
            const api2 = await axios.get(`https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`);
            if (api2.data?.result?.download?.url) {
              downloadUrl = api2.data.result.download.url;
            }
          } catch {
            await m.reply(`❌ No se pudo descargar: ${url}`);
            continue;
          }
        }

        const sendAsDoc = durationMin >= 15;

        await conn.sendMessage(m.chat, {
          [sendAsDoc ? 'document' : 'audio']: { url: downloadUrl },
          mimetype: 'audio/mpeg',
          fileName: `${title || 'audio'}.mp3`,
          ptt: false
        }, { quoted: m });

        await new Promise(r => setTimeout(r, 1500)); // Espera breve entre envíos

      } catch (err) {
        console.error(err);
        await m.reply(`⚠️ Error al procesar un audio: ${err.message}`);
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
