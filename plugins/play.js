import fetch from 'node-fetch';
import yts from 'yt-search';
import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command, args }) => {
  if (!text) {
    return m.reply(`${e} Usa el comando correctamente:\n\n🔎 _Ejemplo:_\n*${usedPrefix + command}* nombre del video o enlace de YouTube`);
  }

  await m.react('🕒');

  try {
    const query = args.join(' ');
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = query.match(ytRegex);

    let video;
    if (match) {
      const id = match[1];
      const result = await yts({ videoId: id });
      video = result;
    } else {
      const search = await yts(query);
      video = search.videos[0];
      if (!video) return m.reply(`${e} No se encontró el video.`);
    }

    const { title, thumbnail, url, timestamp, views, ago, author } = video;

    // Comando -> lógica
    const isAudio = ['play', 'play3'].includes(command);
    const asDocument = ['play3', 'play4'].includes(command);
    const apiUrl = isAudio
      ? `https://delirius-apiofc.vercel.app/download/ytmp3?url=${url}`
      : `https://delirius-apiofc.vercel.app/download/ytmp4?url=${url}`;

    const res = await axios.get(apiUrl);
    const downloadUrl = res.data?.url;
    if (!downloadUrl) return m.reply(`${e} No se pudo obtener el enlace desde Delirius.`);

    const caption = `
🎬 *Título:* ${title}
📺 *Canal:* ${author?.name || 'Desconocido'}
⏱️ *Duración:* ${timestamp || 'N/A'}
👀 *Vistas:* ${views?.toLocaleString() || 'N/A'}
📅 *Publicado:* ${ago || 'N/A'}
🔗 *Link:* ${url}
`.trim();

    await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
        externalAdReply: {
          title,
          body: asDocument
            ? (isAudio ? '📂 Enviando audio como documento...' : '📂 Enviando video como documento...')
            : (isAudio ? '🔊 Enviando audio...' : '🎞️ Enviando video...'),
          thumbnail: await (await fetch(thumbnail)).buffer(),
          thumbnailUrl: redes,
          sourceUrl: redes,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

    const mediaType = asDocument ? 'document' : isAudio ? 'audio' : 'video';
    const mimeType = isAudio ? 'audio/mpeg' : 'video/mp4';

    await conn.sendMessage(m.chat, {
      [mediaType]: { url: downloadUrl },
      mimetype: mimeType,
      fileName: `${title}.${isAudio ? 'mp3' : 'mp4'}`
    }, { quoted: m });

    await m.react('✅');

  } catch (err) {
    console.error(err);
    return m.reply(`❌ Error al procesar: ${err.message}`);
  }
};

// Comandos válidos solo con Delirius
handler.command = ['play', 'play2', 'play3', 'play4'];
handler.group = true;

export default handler;
