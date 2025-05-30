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
      if (!video) return m.reply(`${e} *Video no encontrado.*`);
    }

    const { title, thumbnail, timestamp, views, ago, url, author } = video;

    let yt = await youtubedl(url).catch(() => youtubedlv2(url));
    let videoInfo = yt.video['360p'];
    if (!videoInfo) return m.reply(`${e} *No se encontró una calidad compatible para el video.*`);

    const { fileSizeH: sizeHumanReadable, fileSize } = videoInfo;
    const sizeMB = fileSize / (1024 * 1024);

    let durationMin = 0;
    if (timestamp) {
      const parts = timestamp.split(':').map(Number);
      if (parts.length === 3) {
        durationMin = parts[0] * 60 + parts[1] + parts[2] / 60;
      } else if (parts.length === 2) {
        durationMin = parts[0] + parts[1] / 60;
      } else if (parts.length === 1) {
        durationMin = parts[0];
      }
    }

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
      sendAsDocument = sizeMB >= 100 || durationMin >= 15;
    } else if (normalVideoCommands.includes(command)) {
      isVideo = true;
      sendAsDocument = sizeMB >= 100 || durationMin >= 15;
    }

    const caption = `
╭───── • ─────╮
  𖤐 \`YOUTUBE EXTRACTOR\` 𖤐
╰───── • ─────╯

✦ *📺 Canal:* ${author?.name || 'Desconocido'}
✦ *⏱️ Duración:* ${timestamp || 'N/A'}
✦ *👀 Vistas:* ${views?.toLocaleString() || 'N/A'}
✦ *📅 Publicado:* ${ago || 'N/A'}
✦ *🔗 Link:* ${url}

╭───── • ─────╮
> ${textbot}
╰───── • ─────╯
`.trim();

    await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
        externalAdReply: {
          title,
          body: sendAsDocument
            ? (isAudio ? '📂 Enviando audio como documento...' : '📂 Enviando video como documento...')
            : (isAudio ? '🔊 Enviando audio...' : '🎞️ Enviando video...'),
          thumbnailUrl: redes,
          thumbnail: await (await fetch(thumbnail)).buffer(),
          sourceUrl: redes,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

    // ⚙️ Manejamos múltiples APIs de descarga con tolerancia a fallos
    let downloadUrl = null;
    const apis = [
      async () => {
        const res = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${url}`, { timeout: 10000 });
        return res.data?.data?.dl;
      },
      async () => {
        const res = await axios.get(`https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=480p&apikey=GataDios`, { timeout: 10000 });
        return res.data?.data?.url;
      },
      async () => {
        const res = await axios.get(`https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`, { timeout: 10000 });
        return res.data?.result?.download?.url;
      }
    ];

    for (let i = 0; i < apis.length; i++) {
      try {
        downloadUrl = await apis[i]();
        if (downloadUrl) break;
      } catch (err) {
        console.warn(`API ${i + 1} falló:`, err.code || err.message);
      }
    }

    if (!downloadUrl) {
      return m.reply(`${e} *No se pudo obtener el enlace de descarga.* Intenta más tarde.`);
    }

    const sendPayload = {
      [sendAsDocument ? 'document' : isVideo ? 'video' : 'audio']: { url: downloadUrl },
      mimetype: isVideo ? 'video/mp4' : 'audio/mpeg',
      fileName: `${title}.${isVideo ? 'mp4' : 'mp3'}`
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
