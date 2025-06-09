import axios from 'axios';
import yts from 'yt-search';

const handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) {
    return m.reply(`${e} Ingresa el título de un video o canción de *YouTube*.\n\n*Ejemplo:* \`${usedPrefix + command}\` diles`);
  }
  await m.react('✅');
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
    const isAudio = ['play', 'yta', 'mp3', 'ytmp3', 'playaudio'].includes(command);
    const isAudioDoc = ['play3', 'ytadoc', 'mp3doc', 'ytmp3doc'].includes(command);
    const isVideo = ['play2', 'ytv', 'mp4', 'ytmp4', 'playvid'].includes(command);
    const isVideoDoc = ['play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'].includes(command);
    const isAudioMode = isAudio || isAudioDoc;
    const isVideoMode = isVideo || isVideoDoc;
    if (!isAudioMode && !isVideoMode) {
      return m.reply(`${e} Comando no reconocido.`);
    }
    const durationParts = timestamp.split(':').map(Number);
    const durationMinutes =
      durationParts.length === 3
        ? durationParts[0] * 60 + durationParts[1] + durationParts[2] / 60
        : durationParts.length === 2
        ? durationParts[0] + durationParts[1] / 60
        : parseFloat(durationParts[0]);
    const forceDocByDuration = durationMinutes > 20;
    const asDocument = isAudioDoc || isVideoDoc || (!isAudioDoc && !isVideoDoc && forceDocByDuration);
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
${(!isAudioDoc && !isVideoDoc && forceDocByDuration)
  ? '\n📎 *Este archivo se enviará como documento por superar los 20 minutos.*'
  : ''}

🎧 Enviando ${isAudioMode ? '*audio*' : '*video*'}${asDocument ? ' como *documento*' : ''}...
`.trim();
    await conn.sendFile(m.chat, thumbnail, 'thumb.jpg', caption, m);
    const apiUrl = isAudioMode
      ? `https://stellar.sylphy.xyz/dow/ytmp3?url=${encodeURIComponent(url)}`
      : `https://stellar.sylphy.xyz/dow/ytmp4?url=${encodeURIComponent(url)}`;
    const res = await axios.get(apiUrl);
    const data = res.data?.data;
    const downloadUrl = data?.dl;
    const fileName = `${title}.${data?.format || (isAudioMode ? 'mp3' : 'mp4')}`;
    const mimeType = isAudioMode ? 'audio/mpeg' : 'video/mp4';

    if (!downloadUrl) {
      console.log('[API Response]', data);
      return m.reply(`${e} No se pudo obtener el enlace de descarga.`);
    }
    if (asDocument) {
      await conn.sendMessage(m.chat, {
        document: { url: downloadUrl },
        mimetype: mimeType,
        fileName
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, {
        [isAudioMode ? 'audio' : 'video']: { url: downloadUrl },
        mimetype: mimeType,
        fileName
      }, { quoted: m });
    }
    await m.react('✅');
  } catch (err) {
    console.error(err);
    m.reply(`${e} Ocurrió un error: ${err.message}`);
  }
};

handler.command = ['play', 'yta', 'mp3', 'ytmp3', 'playaudio', 'play3', 'ytadoc', 'mp3doc', 'ytmp3doc', 'play2', 'ytv', 'mp4', 'ytmp4', 'playvid', 'play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'];
handler.group = true;
export default handler;
