import fetch from 'node-fetch';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';
import yts from 'yt-search';
import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command, args }) => {
  if (!text) {
    return m.reply(`${e} Usa el comando correctamente:

🔎 _Ejemplo de uso:_
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
    let audioInfo = yt.audio?.['128kbps'];
    if (!videoInfo && !audioInfo) {
      return m.reply(`${e} *No se encontró calidad compatible para audio o video.*`);
    }

    const { fileSizeH: sizeHumanReadable, fileSize } =
      videoInfo || audioInfo || { fileSizeH: 'Desconocido', fileSize: 0 };

    const sizeMB = fileSize / (1024 * 1024);
    if (sizeMB >= 700) {
      return m.reply(`${e} *El archivo es demasiado pesado (más de 700 MB). Se canceló la descarga.*`);
    }

    const docAudioCommands = ['play3', 'ytadoc', 'mp3doc', 'ytmp3doc'];
    const audioCommands = ['play', 'yta', 'mp3', 'ytmp3'];
    const videoCommands = ['play2', 'ytv', 'mp4', 'ytmp4'];
    const docVideoCommands = ['play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'];

    let isAudioDoc = docAudioCommands.includes(command);
    let isAudio = audioCommands.includes(command);
    let isVideo = videoCommands.includes(command);
    let isVideoDoc = docVideoCommands.includes(command);

    // Forzar envío como documento si es demasiado pesado (>100 MB)
    const isTooHeavy = sizeMB >= 100;
    if (isVideo && isTooHeavy) {
      isVideoDoc = true;
      isVideo = false;
    }
    if (isAudio && isTooHeavy) {
      isAudioDoc = true;
      isAudio = false;
    }

    const videoUrls = [
      'https://files.catbox.moe/rdyj5q.mp4',
      'https://files.catbox.moe/693ws4.mp4'
    ];
    const jpg = videoUrls[Math.floor(Math.random() * videoUrls.length)];
    const im = await (await fetch(icono)).buffer();
    const en = `${
      isAudioDoc ? '📂 Enviando audio como documento...' :
      isAudio ? '🔊 Enviando audio...' :
      isVideo ? '🎞️ Enviando video...' :
      isVideoDoc ? '📂 Enviando video como documento...' :
      '⏳ Procesando...'
    }`;

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
> ${textbot}
╰───── • ─────╯
`.trim();

    const getBuffer = async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error al obtener buffer: ${res.statusText}`);
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    };

    const imBuffer = await getBuffer(thumbnail);

    const formatos = [
      async () => conn.sendMessage(m.chat, {
        text: caption,
        contextInfo: {
          externalAdReply: {
            title: title,
            body: en,
            thumbnailUrl: redes,
            thumbnail: imBuffer,
            sourceUrl: redes,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m }),

      async () => conn.sendMessage(
        m.chat,
        {
          video: { url: jpg },
          gifPlayback: true,
          caption: caption,
          contextInfo: {
            forwardingScore: 0,
            isForwarded: true,
            externalAdReply: {
              title: title,
              body: en,
              thumbnailUrl: redes,
              thumbnail: imBuffer,
              sourceUrl: redes,
              mediaType: 1,
              showAdAttribution: true
            }
          }
        },
        { quoted: m }
      ),

      async () => conn.sendMessage(m.chat, {
        text: caption,
        contextInfo: {
          mentionedJid: [],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelRD.id,
            newsletterName: channelRD.name,
            serverMessageId: -1,
          },
          forwardingScore: false,
          externalAdReply: {
            title: title,
            body: en,
            thumbnailUrl: redes,
            thumbnail: imBuffer,
            sourceUrl: redes,
            mediaType: 1,
            showAdAttribution: true,
            renderLargerThumbnail: true,
          },
        },
      }, { quoted: m })
    ];

    const randomFormato = formatos[Math.floor(Math.random() * formatos.length)];
    await randomFormato();

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
    return m.reply(`${e} Ocurrió un error inesperado al procesar el formato.`);
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
