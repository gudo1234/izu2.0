import fetch from 'node-fetch';
import yts from 'yt-search';
import axios from 'axios';

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`*[❗] Usa el comando con el nombre o enlace de un video de YouTube.*`);

  await m.react('🕒');

  try {
    let video;
    const ytMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(youtube\.com|youtu\.be)\/[^\s]+/);
    if (ytMatch) {
      const ytres = await yts({ videoId: ytMatch[0].split('v=')[1]?.substring(0, 11) });
      video = ytres;
    } else {
      const ytres = await yts(text);
      video = ytres.videos[0];
      if (!video) return m.reply('*[❗] Video no encontrado.*');
    }

    const { title, thumbnail, timestamp, views, ago, url, author } = video;

    const infoMsg = `
╭───── • ─────╮
  𖤐 \`YOUTUBE MP3\` 𖤐
╰───── • ─────╯

✦ *📺 Canal:* ${author?.name || 'Desconocido'}
✦ *⏱️ Duración:* ${timestamp || 'N/A'}
✦ *👀 Vistas:* ${views?.toLocaleString() || 'N/A'}
✦ *📅 Publicado:* ${ago || 'N/A'}
✦ *🔗 Link:* ${url}
`.trim();

    await conn.sendMessage(m.chat, {
      text: infoMsg,
      contextInfo: {
        externalAdReply: {
          title,
          body: '🔊 Descargando audio...',
          thumbnail: await (await fetch(thumbnail)).buffer(),
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: url
        }
      }
    }, { quoted: m });

    let downloadUrl;
    try {
      const apiRes = await axios.get(`https://bk9.fun/download/ytmp3?url=${encodeURIComponent(url)}`);
      if (!apiRes.data?.status || !apiRes.data?.result?.url) return m.reply('*[❗] No se pudo obtener el enlace de descarga.*');
      downloadUrl = apiRes.data.result.url;
    } catch (e) {
      console.error(e);
      return m.reply('*[❗] Error al acceder a la API.*');
    }

    await conn.sendMessage(m.chat, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
    }, { quoted: m });

    await m.react('✅');

  } catch (err) {
    console.error(err);
    return m.reply(`*[❗] Ocurrió un error inesperado:*\n${err.message || err}`);
  }
};

handler.command = ['o'];
export default handler;
