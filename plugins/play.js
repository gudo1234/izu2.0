import fetch from 'node-fetch';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';
import yts from 'yt-search';
import axios from 'axios';
import Starlights from '@StarlightsTeam/Scraper';

const handler = async (m, { conn, text, usedPrefix, command, args }) => {
  if (!text) {
    return m.reply(`${e} Usa el comando correctamente:\n\n🔎 _Ejemplo de uso:_ \n*${usedPrefix + command}* diles\n*${usedPrefix + command}* https://youtube.com/watch?v=E0hGQ4tEJhI`);
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
      if (!video) return m.reply(`${e} *Video no encontrado.*`);
    }

    const { title, thumbnail, timestamp, views, ago, url, author } = video;

    function durationToSeconds(duration) {
      const parts = duration.split(':').map(Number);
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      return 0;
    }

    const durationSeconds = durationToSeconds(timestamp || '0:00');
    const durationMinutes = durationSeconds / 60;

    const docAudioCommands = ['play3', 'ytadoc', 'mp3doc', 'ytmp3doc'];
    const docVideoCommands = ['play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'];
    const normalAudioCommands = ['play', 'yta', 'mp3', 'ytmp3'];
    const normalVideoCommands = ['play2', 'ytv', 'mp4', 'ytmp4'];

    let sendAsDocument = false;
    let isAudio = false;
    let isVideo = false;

    if (docAudioCommands.includes(command)) {
      isAudio = true;
      sendAsDocument = true;
    } else if (docVideoCommands.includes(command)) {
      isVideo = true;
      sendAsDocument = true;
    } else if (normalAudioCommands.includes(command)) {
      isAudio = true;
    } else if (normalVideoCommands.includes(command)) {
      isVideo = true;
    }

    if (!sendAsDocument && durationMinutes > 20) sendAsDocument = true;

    const tipoArchivo = isAudio
      ? (sendAsDocument ? 'audio (documento)' : 'audio')
      : (sendAsDocument ? 'video (documento)' : 'video');

    const caption = `
╭───── • ─────╮
  𖤐 \`YOUTUBE EXTRACTOR\` 𖤐
╰───── • ─────╯

✦ *📺 Canal:* ${author?.name || 'Desconocido'}
✦ *⏱️ Duración:* ${timestamp || 'N/A'}
✦ *👀 Vistas:* ${views?.toLocaleString() || 'N/A'}
✦ *📅 Publicado:* ${ago || 'N/A'}
✦ *🔗 Link:* ${url}

> 🕒 Se está preparando el *${tipoArchivo}*...${durationMinutes > 20 && !sendAsDocument ? `\n\n${e} *Se enviará como documento por superar los 20 minutos.*` : ''}
`.trim();

    await conn.sendFile(m.chat, thumbnail, 'thumb.jpg', caption, m, null, rcanal);

    let fileData;
    try {
      fileData = isAudio
        ? await Starlights.ytmp3(url)
        : await Starlights.ytmp4(url);

      const mimetype = isAudio ? 'audio/mpeg' : 'video/mp4';
      await conn.sendMessage(m.chat, {
        [sendAsDocument ? 'document' : isAudio ? 'audio' : 'video']: { url: fileData.dl_url },
        mimetype,
        fileName: `${fileData.title}.${isAudio ? 'mp3' : 'mp4'}`
      }, { quoted: m });

      return await m.react('✅');
    } catch (err) {
      m.react('🔄')
    }
    let downloadUrl = null;
    const fallbackApis = [
      `https://delirius-apiofc.vercel.app/download/ytmp4?url=${url}`,
      `https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=480p&apikey=GataDios`,
      `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`,
      `https://www.velyn.biz.id/api/downloader/ytmp4?url=${url}`,
      `https://api.nekorinn.my.id/downloader/savetube?url=${encodeURIComponent(url)}&format=720`,
      `https://api.zenkey.my.id/api/download/ytmp4?apikey=zenkey&url=${url}`,
      `https://axeel.my.id/api/download/video?url=${encodeURIComponent(url)}`,
      `https://api.siputzx.my.id/api/d/ytmp4?url=${url}`
    ];

    for (const api of fallbackApis) {
      try {
        const res = await axios.get(api);
        downloadUrl = res.data?.url || res.data?.data?.url || res.data?.data?.dl || res.data?.result?.download?.url;
        if (downloadUrl) break;
      } catch (e) {
        continue;
      }
    }

    if (!downloadUrl) return m.reply(`${e} *No se pudo obtener el enlace de descarga.*`);

    const sendPayload = {
      [sendAsDocument ? 'document' : isVideo ? 'video' : 'audio']: { url: downloadUrl },
      mimetype: isVideo ? 'video/mp4' : 'audio/mpeg',
      fileName: `${title}.${isVideo ? 'mp4' : 'mp3'}`
    };

    await conn.sendMessage(m.chat, sendPayload, { quoted: m });
    await m.react('✅');

  } catch (err) {
    console.error('[ERROR]', err);
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
