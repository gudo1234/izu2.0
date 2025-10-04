import fetch from 'node-fetch';
import yts from 'yt-search';
import axios from 'axios';

const STELLAR_APIKEY = 'stellar-LgIsemtM'; // tu apikey

const handler = async (m, { conn, text, usedPrefix, command, args }) => {
  const docAudioCommands = ['play3', 'ytadoc', 'mp3doc', 'ytmp3doc'];
  const docVideoCommands = ['play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'];
  const normalAudioCommands = ['play', 'yta', 'mp3', 'ytmp3'];
  const normalVideoCommands = ['play2', 'ytv', 'mp4', 'ytmp4'];

  // Mensajes de ayuda si no hay texto
  if (!text) {
    let ejemplo = '';
    if (normalAudioCommands.includes(command)) {
      ejemplo = `🎵 _Asegúrese de ingresar un texto o un URL de YouTube para descargar el audio._\n\n🔎 Ejemplo:\n*${usedPrefix + command}* diles\n*${usedPrefix + command}* https://youtube.com/watch?v=E0hGQ4tEJhI`;
    } else if (docAudioCommands.includes(command)) {
      ejemplo = `📄 _Asegúrese de ingresar un texto o un URL de YouTube para descargar el audio en documento._\n\n🔎 Ejemplo:\n*${usedPrefix + command}* diles\n*${usedPrefix + command}* https://youtube.com/watch?v=E0hGQ4tEJhI`;
    } else if (normalVideoCommands.includes(command)) {
      ejemplo = `🎥 _Asegúrese de ingresar un texto o un URL de YouTube para descargar el video._\n\n🔎 Ejemplo:\n*${usedPrefix + command}* diles\n*${usedPrefix + command}* https://youtube.com/watch?v=E0hGQ4tEJhI`;
    } else if (docVideoCommands.includes(command)) {
      ejemplo = `📄 _Asegúrese de ingresar un texto o un URL de YouTube para descargar el video en documento._\n\n🔎 Ejemplo:\n*${usedPrefix + command}* diles\n*${usedPrefix + command}* https://youtube.com/watch?v=E0hGQ4tEJhI`;
    }
    return m.reply(ejemplo);
  }

  await m.react('🕒');
  try {
    const query = args.join(' ').trim();

    // Detección de todos los tipos de URL de YouTube
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const ytMatch = query.match(ytRegex);

    let video;
    if (ytMatch) {
      const videoId = ytMatch[1];
      // Buscar por ID correctamente
      const { videos } = await yts({ videoId });
      video = videos?.length ? videos[0] : null;

      // Si no devuelve resultado, usar una búsqueda manual
      if (!video) {
        const ytres = await yts(`https://youtube.com/watch?v=${videoId}`);
        video = ytres.videos[0];
      }
    } else {
      const ytres = await yts(query);
      video = ytres.videos[0];
    }

    if (!video) return m.reply(`${e} No se pudo obtener información del video.`);

    const { title, thumbnail, timestamp, views, ago, url, author } = video;

    const duration = timestamp && timestamp !== 'N/A' ? timestamp : '0:00';

    function durationToSeconds(duration) {
      const parts = duration.split(':').map(Number);
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      return 0;
    }

    const durationSeconds = durationToSeconds(duration);
    const durationMinutes = durationSeconds / 60;

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

✦ *🎵 Título:* ${title || 'Desconocido'}
✦ *📺 Canal:* ${author?.name || 'Desconocido'}
✦ *⏱️ Duración:* ${timestamp || 'N/A'}
✦ *👀 Vistas:* ${views?.toLocaleString() || 'N/A'}
✦ *📅 Publicado:* ${ago || 'N/A'}
✦ *🔗 Link:* ${url}

> 🕒 Se está preparando el *${tipoArchivo}*...${
  durationMinutes > 20 && !docAudioCommands.includes(command) && !docVideoCommands.includes(command)
    ? `\n\n${e} *Se enviará como documento por superar los 20 minutos.*`
    : ''
}
`.trim();

    await conn.sendFile(m.chat, thumbnail, 'thumb.jpg', caption, m);

    // API principal
    let apiUrl = isAudio
      ? `https://api.stellarwa.xyz/dow/ytmp3?url=${encodeURIComponent(url)}&apikey=${STELLAR_APIKEY}`
      : `https://api.stellarwa.xyz/dow/ytmp4?url=${encodeURIComponent(url)}&apikey=${STELLAR_APIKEY}`;

    let data;
    try {
      const res = await axios.get(apiUrl);
      data = res.data;
    } catch {
      data = null;
    }

    if (!data || !data.data?.dl) {
      return m.reply(`${e} *No se pudo obtener el enlace de descarga.*`);
    }

    const mimetype = isAudio ? 'audio/mpeg' : 'video/mp4';
    const fileName = `${data.data.title || title}.${isAudio ? 'mp3' : 'mp4'}`;

    await conn.sendMessage(
      m.chat,
      {
        [sendAsDocument ? 'document' : isAudio ? 'audio' : 'video']: { url: data.data.dl },
        mimetype,
        fileName,
      },
      { quoted: m }
    );

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
