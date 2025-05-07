import fetch from 'node-fetch';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';
import yts from 'yt-search';
import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command, args }) => {
  if (!text) {
    return m.reply(`${e} Usa el comando correctamente:

📌 Ejemplo de uso:
*${usedPrefix + command}* diles
*${usedPrefix + command}* https://youtube.com/watch?v=E0hGQ4tEJhI`);
  }

  await m.react('🕒');

  try {
    const query = args.join(' ');
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const ytMatch = query.match(ytRegex);

    let video;
    if (ytMatch) {
      const videoId = ytMatch[1];
      const ytres = await yts({ videoId });
      video = ytres;
    } else {
      const ytres = await yts(query);
      video = ytres.videos[0];
      if (!video) {
        return m.reply(`${e} *Video no encontrado.*`);
      }
    }

    const { title, thumbnail, timestamp, views, ago, url, author } = video;

    let yt = await youtubedl(url).catch(() => youtubedlv2(url));
    let videoInfo = yt.video['360p'];
    if (!videoInfo) {
      return m.reply(`${e} *No se encontró una calidad compatible para el video.*`);
    }

    const { fileSizeH: sizeHumanReadable, fileSize } = videoInfo;
    const sizeMB = fileSize / (1024 * 1024);

    if (sizeMB >= 700) {
      return m.reply(`${e} *El archivo es demasiado pesado (más de 700 MB). Se canceló la descarga.*`);
    }

    const docAudioCommands = ['play3', 'ytadoc', 'mp3doc', 'ytmp3doc'];
    const videoCommands = ['play2', 'ytv', 'mp4', 'ytmp4'];
    const docVideoCommands = ['play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'];

    const isAudioDoc = docAudioCommands.includes(command);
    const isVideo = videoCommands.includes(command);
    const isVideoDoc = docVideoCommands.includes(command);

    const caption = `
╭───── • ─────╮
  𖤐 \`YOUTUBE EXTRACTOR\` 𖤐
╰───── • ─────╯

✦ *🎶 Título:* ${title}
✦ *📺 Canal:* ${author?.name || 'Desconocido'}
✦ *⏱️ Duración:* ${timestamp || 'N/A'}
✦ *👀 Vistas:* ${views?.toLocaleString() || 'N/A'}
✦ *📅 Publicado:* ${ago || 'N/A'}
✦ *💾 Tamaño:* ${sizeHumanReadable}
✦ *🔗 Link:* ${url}

╭───── • ─────╮
> ${
  isAudioDoc ? '📂 Enviando audio como documento...' :
  isVideo ? '🎞️ Enviando video...' :
  isVideoDoc ? '📂 Enviando video como documento...' :
  '🔊 Enviando audio...'
}
╰───── • ─────╯
`.trim();
    await conn.sendFile(m.chat, thumbnail, 'thumbnail.jpg', txt, m, null, rcanal);

    let downloadUrl;

    try {
      const api1 = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${url}`);
      if (api1.data?.data?.dl) {
        downloadUrl = api1.data.data.dl;
      } else {
        throw new Error();
      }
    } catch {
      try {
        const api2 = await axios.get(`https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`);
        if (api2.data?.result?.download?.url) {
          downloadUrl = api2.data.result.download.url;
        }
      } catch {
        return m.reply(`${e} *Error al obtener el enlace de descarga desde las APIs.*`);
      }
    }

    if (!downloadUrl) {
      return m.reply(`${e} *No se pudo procesar la descarga.*`);
    }

    const sendPayload = {
      [isVideoDoc ? 'document' : isVideo ? 'video' : isAudioDoc ? 'document' : 'audio']: { url: downloadUrl },
      mimetype: isVideo || isVideoDoc ? 'video/mp4' : 'audio/mpeg',
      fileName: `${title}.${isVideo || isVideoDoc ? 'mp4' : 'mp3'}`
    };
    await conn.sendMessage(m.chat, sendPayload, { quoted: m });

    await m.react('✅');

  } catch (err) {
    console.error('Error:', err);
    return m.reply(`❗ Ocurrió un error inesperado al procesar el formato.`);
  }
};

handler.command = [
  'play', 'yta', 'mp3', 'ytmp3',
  'play3', 'ytadoc', 'mp3doc', 'ytmp3doc',
  'play2', 'ytv', 'mp4', 'ytmp4',
  'play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'
];

handler.group = true;
export default handler;
