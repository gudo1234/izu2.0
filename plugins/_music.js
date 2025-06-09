import axios from 'axios';
import yts from 'yt-search';
import Starlights from '@StarlightsTeam/Scraper';

const handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) return m.reply(`${e} Ingresa el título o link de *YouTube*.\n\n*Ejemplo:* \`${usedPrefix + command}\` diles`);

  await m.react('🕒');
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

    if (!isAudioMode && !isVideoMode) return m.reply(`${e} Comando no reconocido.`);

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
${forceDocByDuration ? '\n📎 *Este archivo se enviará como documento por superar los 20 minutos.*' : ''}
`.trim();

    await conn.sendFile(m.chat, thumbnail, 'thumb.jpg', caption, m);

    let downloadUrl;
    let fileName = `${title}.${isAudioMode ? 'mp3' : 'mp4'}`;
    let mimeType = isAudioMode ? 'audio/mpeg' : 'video/mp4';

    // 1. Primer intento: Stellar API
    try {
      const stellar = await axios.get(
        `https://stellar.sylphy.xyz/dow/${isAudioMode ? 'ytmp3' : 'ytmp4'}?url=${encodeURIComponent(url)}`
      );
      if (stellar?.data?.result?.url) {
        downloadUrl = stellar.data.result.url;
      } else if (stellar?.data?.url) {
        downloadUrl = stellar.data.url;
      }
    } catch (e) {
      console.log('Fallo Stellar API:', e.message);
    }

    // 2. Segundo intento: StarlightsTeam-Scraper
    if (!downloadUrl) {
      try {
        const result = isAudioMode
          ? await Starlights.ytmp3(url)
          : await Starlights.ytmp4(url);
        downloadUrl = result?.dl_url;
      } catch (e) {
        console.log('Fallo StarlightsTeam:', e.message);
      }
    }

    // 3. Tercer intento: APIs de respaldo
    const fallbackApis = [
      `https://delirius-apiofc.vercel.app/download/ytmp4?url=${url}`,
      `https://api.neoxr.eu/api/youtube?url=${url}&type=${isAudioMode ? 'audio' : 'video'}&apikey=GataDios`,
      `https://api.vreden.my.id/api/yt${isAudioMode ? 'mp3' : 'mp4'}?url=${encodeURIComponent(url)}`,
      `https://www.velyn.biz.id/api/downloader/yt${isAudioMode ? 'mp3' : 'mp4'}?url=${url}`,
      `https://api.nekorinn.my.id/downloader/savetube?url=${encodeURIComponent(url)}&format=720`,
      `https://api.zenkey.my.id/api/download/yt${isAudioMode ? 'mp3' : 'mp4'}?apikey=zenkey&url=${url}`,
      `https://axeel.my.id/api/download/${isAudioMode ? 'audio' : 'video'}?url=${encodeURIComponent(url)}`,
      `https://api.siputzx.my.id/api/d/yt${isAudioMode ? 'mp3' : 'mp4'}?url=${url}`
    ];

    if (!downloadUrl) {
      for (const api of fallbackApis) {
        try {
          const res = await axios.get(api);
          downloadUrl = res.data?.url || res.data?.data?.url || res.data?.result?.url || res.data?.result?.download?.url;
          if (downloadUrl) break;
        } catch (e) {
          console.log('Fallo API de respaldo:', api);
          continue;
        }
      }
    }

    if (!downloadUrl) return m.reply(`${e} *No se pudo obtener el enlace de descarga.*`);

    await conn.sendMessage(m.chat, {
      [asDocument ? 'document' : isAudioMode ? 'audio' : 'video']: { url: downloadUrl },
      mimetype: mimeType,
      fileName
    }, { quoted: m });

    await m.react('✅');
  } catch (err) {
    console.error('[ERROR]', err);
    return m.reply(`${e} Error inesperado: ${err.message || err}`);
  }
};

handler.command = [
  'play', 'yta', 'mp3', 'ytmp3', 'playaudio',
  'play3', 'ytadoc', 'mp3doc', 'ytmp3doc',
  'play2', 'ytv', 'mp4', 'ytmp4', 'playvid',
  'play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'
];

export default handler;
