import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.includes('list=')) {
    return m.reply(`📂 Usa el comando correctamente:\n\nEjemplo:\n${usedPrefix}${command} https://youtube.com/playlist?list=PLRW7iEDD9RDRv8EQ3AO-CUqmKfEkaYQ2M`);
  }

  await m.react('🔎');

  try {
    const res = await axios.get(`https://api.luminai.my.id/api/yt/playlist?url=${encodeURIComponent(text)}`);
    const result = res.data;

    if (!result || !result.data || !result.data.length) {
      return m.reply('❌ No se encontraron videos en la playlist.');
    }

    const videos = result.data;

    m.reply(`🎧 Se encontraron ${videos.length} canciones en la playlist. Enviando audios...`);

    for (const video of videos) {
      try {
        const { title, url, duration, thumbnail } = video;

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

        const msgText = `🎶 *${title}*\n⏱️ ${duration || 'Desconocido'}\n🔗 ${url}`;
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
    return m.reply(`❌ Error al obtener la playlist: ${err.message || err}`);
  }
};

handler.command = ['playlist'];
export default handler;
