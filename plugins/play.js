import fetch from 'node-fetch';
import yts from 'yt-search';
import axios from 'axios';

//const STELLAR_APIKEY = 'stellar-LgIsemtM';

const handler = async (m, { conn, text, usedPrefix, command, args }) => {
  const docAudioCommands = ['play3', 'ytadoc', 'mp3doc', 'ytmp3doc'];
  const docVideoCommands = ['play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'];
  const normalAudioCommands = ['play', 'yta', 'mp3', 'ytmp3'];
  const normalVideoCommands = ['play2', 'ytv', 'mp4', 'ytmp4'];

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

    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const ytMatch = query.match(ytRegex);

    let video;
    if (ytMatch) {
      const videoId = ytMatch[1];
      const ytres = await yts(`https://youtube.com/watch?v=${videoId}`);
      video = ytres.videos.length ? ytres.videos[0] : null;
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

    await conn.sendFile(m.chat, thumbnail, 'thumb.jpg', caption, m, null, rcanal);

    const apiUrlMain = `https://api.stellarwa.xyz/dow/ytmp3v2?url=${encodeURIComponent(url)}&apikey=${apiKey}`;
    const apiUrlBackup = `https://api.stellarwa.xyz/dow/ytmp4v2?url=${encodeURIComponent(url)}&apikey=${apiKey}`;

    let data;
    let usedBackup = false;

    try {
      const res = await axios.get(apiUrlMain);
      data = res.data;
      if (!data || !data.data?.dl) throw new Error('Sin enlace de descarga principal');
    } catch (err) {
      console.error('Error en API principal, usando respaldo...', err.response?.data || err);
      usedBackup = true;
      try {
        const resBackup = await axios.get(apiUrlBackup);
        data = resBackup.data;
      } catch (err2) {
        console.error('Error también en API de respaldo:', err2.response?.data || err2);
        return m.reply(`${e} *No se pudo obtener el enlace de descarga de ninguna API.*`);
      }
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

    // ✅ Reacción final según API usada
    if (usedBackup) {
      await m.react('⌛'); // Segunda API usada
    } else {
      await m.react('✅'); // Primera API exitosa
    }

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
