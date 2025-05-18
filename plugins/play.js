import fetch from 'node-fetch';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';
import yts from 'yt-search';
import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command, args }) => {
  if (!text) {
    return m.reply(`${e} Usa el comando correctamente:\n\n🔎 _Ejemplo de uso:_\n*${usedPrefix + command}* diles\n*${usedPrefix + command}* https://youtube.com/watch?v=E0hGQ4tEJhI`);
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
      if (!video) return m.reply(`❌ *Video no encontrado.*`);
    }

    const { title, thumbnail, timestamp, views, ago, url, author } = video;

    let yt = await youtubedl(url).catch(() => youtubedlv2(url));
    let videoInfo = yt.video['360p'];
    if (!videoInfo) return m.reply(`${e} *No se encontró una calidad compatible para el video.*`);

    const { fileSizeH: sizeHumanReadable, fileSize } = videoInfo;
    const sizeMB = fileSize / (1024 * 1024);

    // Extraer minutos de duración (e.g. "20:14" => 20 minutos)
    const durationMin = timestamp ? parseInt(timestamp.split(':')[0]) : 0;

    // Establece flags si se debe enviar como documento
    const tooBig = sizeMB >= 100 || durationMin >= 15;

    const docAudioCommands = ['play3', 'ytadoc', 'mp3doc', 'ytmp3doc'];
    const videoCommands = ['play2', 'ytv', 'mp4', 'ytmp4'];
    const docVideoCommands = ['play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'];

    const isAudioDoc = docAudioCommands.includes(command);
    const isVideo = videoCommands.includes(command);
    const isVideoDoc = docVideoCommands.includes(command);

    // Si el formato supera límite, forzar envío como documento
    const sendAsDocument = isAudioDoc || isVideoDoc || tooBig;

    const caption = `
╭───── • ─────╮
  𖤐 \`YOUTUBE EXTRACTOR\` 𖤐
╰───── • ─────╯

✦ *📺 Canal:* ${author?.name || 'Desconocido'}
✦ *⏱️ Duración:* ${timestamp || 'N/A'}
✦ *👀 Vistas:* ${views?.toLocaleString() || 'N/A'}
✦ *📅 Publicado:* ${ago || 'N/A'}
✦ *💾 Tamaño:* ${sizeHumanReadable}
✦ *🔗 Link:* ${url}

╭───── • ─────╮
> SIMPLE BOT - WHATSAPP
╰───── • ─────╯
`.trim();

    // Mostrar vista previa antes de enviar archivo
    await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
        externalAdReply: {
          title,
          body: tooBig ? '📂 Enviando como documento por tamaño o duración...' :
                isAudioDoc ? '📂 Enviando audio como documento...' :
                isVideo ? '🎞️ Enviando video...' :
                '🔊 Enviando audio...',
          thumbnailUrl: thumbnail,
          thumbnail: await (await fetch(thumbnail)).buffer(),
          sourceUrl: url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

    // Obtener URL de descarga
    let downloadUrl;
    try {
      const api1 = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${url}`);
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
        return m.reply(`${e} *Error al obtener el enlace de descarga.*`);
      }
    }

    if (!downloadUrl) return m.reply(`${e} *No se pudo procesar la descarga.*`);

    const sendPayload = {
      [sendAsDocument ? 'document' : (isVideo || isVideoDoc) ? 'video' : 'audio']: { url: downloadUrl },
      mimetype: (isVideo || isVideoDoc) ? 'video/mp4' : 'audio/mpeg',
      fileName: `${title}.${(isVideo || isVideoDoc) ? 'mp4' : 'mp3'}`
    };

    await conn.sendMessage(m.chat, sendPayload, { quoted: m });
    await m.react('✅');

  } catch (err) {
    console.error('Error en línea:', err.stack || err);
    return m.reply(`${e} Error inesperado: ${err.message || err}`);
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
