import ytpl from 'ytpl';
import axios from 'axios';
import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.includes('youtube.com/playlist')) {
    return m.reply(`📄 Uso correcto:\n${usedPrefix + command} <enlace de playlist>\n\nEjemplo:\n${usedPrefix + command} https://youtube.com/playlist?list=...`);
  }

  await m.reply('🔄 Obteniendo lista de canciones, espera un momento...');

  try {
    const playlist = await ytpl(text, { pages: 1 });
    if (!playlist.items.length) return m.reply('❌ No se encontraron canciones en la playlist.');

    await m.reply(`🎧 Se encontraron *${playlist.items.length}* canciones. Enviando audios...`);

    for (const video of playlist.items) {
      try {
        const { title, url, durationSec } = video;
        const durationMin = durationSec / 60;

        // Obtener enlace de descarga (puedes adaptar a tu lógica externa)
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
            await m.reply(`❌ No se pudo descargar: ${title}`);
            continue;
          }
        }

        if (!downloadUrl) {
          await m.reply(`❌ No se encontró enlace para: ${title}`);
          continue;
        }

        const sendAsDoc = durationMin >= 15;

        await conn.sendMessage(m.chat, {
          [sendAsDoc ? 'document' : 'audio']: { url: downloadUrl },
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`,
          ptt: false
        }, { quoted: m });

        await new Promise(r => setTimeout(r, 1500)); // Espera breve entre envíos

      } catch (e) {
        console.error('Error procesando canción:', e);
        await m.reply(`❌ Error con una canción: ${e.message}`);
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
