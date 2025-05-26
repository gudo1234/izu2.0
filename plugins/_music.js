import fetch from 'node-fetch';
import yts from 'yt-search';
import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command, args }) => {
  if (!text) {
    return m.reply(`*Ejemplo de uso:*\n${usedPrefix + command} diles\n${usedPrefix + command} https://youtube.com/watch?v=VSL5F43qgng`);
  }

  await m.react('🔎');

  const query = args.join(' ');
  const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const ytMatch = query.match(ytRegex);

  let video;
  if (ytMatch) {
    const res = await yts({ videoId: ytMatch[1] });
    video = res;
  } else {
    const res = await yts(query);
    video = res.videos[0];
    if (!video) return m.reply('❌ Video no encontrado.');
  }

  const { title, url, timestamp, views, ago, author, thumbnail } = video;

  const apiKey = 'mOpoAHjJ';
  const apiUrl = `https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(url)}&apikey=${apiKey}`;
  let data;

  try {
    const res = await axios.get(apiUrl);
    data = res.data?.result;
  } catch (e) {
    console.error(e);
    return m.reply('❌ Error al obtener información desde la API.');
  }

  const caption = `
╭───────⊷
├ *Título:* ${title}
├ *Duración:* ${timestamp || 'N/A'}
├ *Vistas:* ${views?.toLocaleString() || 'N/A'}
├ *Publicado:* ${ago || 'N/A'}
├ *Canal:* ${author?.name || 'N/A'}
╰───────⊷
`.trim();

  await conn.sendMessage(m.chat, {
    image: { url: thumbnail },
    caption,
    contextInfo: {
      externalAdReply: {
        title,
        body: 'Enviando audio...',
        thumbnailUrl: thumbnail,
        sourceUrl: url,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });

  await conn.sendMessage(m.chat, {
    audio: { url: data.audio },
    mimetype: 'audio/mpeg',
    fileName: `${title}.mp3`
  }, { quoted: m });

  await m.react('✅');
};

handler.command = ['music'];
handler.group = false;

export default handler;
