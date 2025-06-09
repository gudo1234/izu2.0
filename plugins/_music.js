import axios from 'axios';
import yts from 'yt-search';

const handler = async (m, { conn, text, command }) => {
  if (!text) {
    return m.reply(`${e} Usa el comando correctamente:\n\n📌 *Ejemplo:*\n.audio diles\n.video https://youtube.com/watch?v=abc123XYZ`);
  }
  await m.react('🎵');
  try {
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const ytMatch = text.match(ytRegex);
    let video;
    if (ytMatch) {
      const ytres = await yts({ videoId: ytMatch[1] });
      video = ytres;
    } else {
      const ytres = await yts(text);
      video = ytres.videos[0];
      if (!video) return m.reply(`${e} *No se encontró el video.*`);
    }
    const { title, url, thumbnail, timestamp, views, ago, author } = video;
    const isAudio = command === 'audio';
    const isVideo = command === 'video';
    const caption = `
╭────── ⋆⋅☆⋅⋆ ──────╮
   𖤐 \`YOUTUBE EXTRACTOR\` 𖤐
╰────── ⋆⋅☆⋅⋆ ──────╯

✦ *Título:* ${title}
✦ *Duración:* ${timestamp}
✦ *Vistas:* ${views?.toLocaleString() || 'N/A'}
✦ *Publicado:* ${ago || 'N/A'}
✦ *Canal:* ${author?.name || 'Desconocido'}
✦ *Enlace:* ${url}

🎧 Enviando ${isAudio ? '*audio*' : '*video*'}...
`.trim();
    await conn.sendFile(m.chat, thumbnail, 'thumb.jpg', caption, m, null, rcanal);
    const res = await axios.get(`https://stellar.sylphy.xyz/dow/ytmp4?url=${encodeURIComponent(url)}`);
    const data = res.data;
    const downloadUrl = isAudio ? data.audio?.url : data.video?.url;
    const fileName = `${title}.${isAudio ? 'mp3' : 'mp4'}`;
    const mimeType = isAudio ? 'audio/mpeg' : 'video/mp4';
    if (!downloadUrl) return m.reply(`${e} No se pudo obtener el enlace de descarga.`);
    await conn.sendMessage(m.chat, {
      [isAudio ? 'audio' : 'video']: { url: downloadUrl },
      mimetype: mimeType,
      fileName
    }, { quoted: m });
    await m.react('✅');
  } catch (err) {
    console.error(err);
    m.reply(`${e} Ocurrió un error: ${err.message}`);
  }
};

handler.command = ['audio', 'video'];
handler.group = true;
export default handler;
