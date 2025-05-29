import fetch from 'node-fetch';
import yts from 'yt-search';
import axios from 'axios';

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text || !text.includes('list=')) {
    return m.reply(`📂 Usa el comando correctamente:\n\nEjemplo:\n${usedPrefix}${command} https://youtube.com/playlist?list=PLRW7iEDD9RDRv8EQ3AO-CUqmKfEkaYQ2M`);
  }

  const listIdMatch = text.match(/list=([a-zA-Z0-9_-]+)/);
  if (!listIdMatch) return m.reply('❌ No se encontró un ID de playlist válido en el enlace.');

  const listId = listIdMatch[1];
  await m.react('🔎');

  try {
    const search = await yts(listId);
    const videos = search.videos.filter(v => v.url.includes(`/watch`) && v.url.includes(`list=${listId}`));

    if (!videos.length) return m.reply('❌ No se encontraron videos en la playlist.');

    m.reply(`🎧 Se encontraron ${videos.length} canciones en la playlist. Enviando audios...`);

    for (const video of videos) {
      try {
        const { title, url, timestamp, thumbnail } = video;

        const apis = [
          `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(url)}`,
          `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`
        ];

        let dlLink = null;
        for (const api of apis) {
          try {
            const r = await axios.get(api);
            dlLink = r.data?.data?.dl || r.data?.result?.download?.url;
            if (dlLink) break;
          } catch {}
        }

        if (!dlLink) {
          await m.reply(`⚠️ Error al procesar: *${title}*`);
          continue;
        }

        const msgText = `🎶 *${title}*\n⏱️ ${timestamp || 'Desconocido'}\n🔗 ${url}`;
        await conn.sendMessage(m.chat, {
          text: msgText,
          contextInfo: {
            externalAdReply: {
              title,
              body: '🎧 Descargando audio...',
              thumbnailUrl: thumbnail,
              mediaType: 1,
              sourceUrl: url,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: m });

        await conn.sendMessage(m.chat, {
          audio: { url: dlLink },
          fileName: `${title}.mp3`,
          mimetype: 'audio/mpeg'
        }, { quoted: m });

        await new Promise(r => setTimeout(r, 3000));
      } catch (err) {
        console.error('[ERROR audio]', err.message);
        await m.reply(`❌ Error al enviar *${video.title}*`);
      }
    }

    await m.react('✅');
  } catch (err) {
    console.error('Error en playlist:', err.stack || err);
    return m.reply(`❌ Error inesperado: ${err.message || err}`);
  }
};

handler.command = ['playlist'];
export default handler;
