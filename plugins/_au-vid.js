import ytSearch from 'yt-search';
import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*Uso correcto:*\n${usedPrefix + command} <título o enlace de YouTube>`;

  const isAudio = command === 'audio';
  const waitMessage = isAudio
    ? '⏳ Buscando y procesando el audio...'
    : '⏳ Buscando y procesando el video...';
  const errorMessage = '❌ Ocurrió un error. Intenta nuevamente más tarde.';
  const apiKey = 'mOpoAHjJ';

  try {
    await m.reply(waitMessage);

    const result = await ytSearch(text);
    const video = result.videos[0];
    if (!video) throw '❌ No se encontró ningún video.';
    if (video.seconds >= 3600) throw '❌ El video supera 1 hora de duración.';

    const apiRes = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${video.url}&apikey=${apiKey}`);
    const response = await apiRes.json();

    const caption = `
*∘ Título:* ${video.title}
*∘ Duración:* ${video.timestamp}
*∘ Vistas:* ${video.views.toLocaleString()}
*∘ Subido:* ${video.ago}
*∘ Canal:* ${video.author.name}
*∘ URL:* ${video.url}
`.trim();

    // Enviar imagen con información
    await conn.sendMessage(m.chat, {
      image: { url: video.image },
      caption
    }, { quoted: m });

    if (isAudio) {
      // Enviar solo el audio
      await conn.sendMessage(m.chat, {
        audio: { url: response.result?.mp3 },
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`
      }, { quoted: m });
    } else {
      // Enviar solo el video con título como caption
      await conn.sendMessage(m.chat, {
        video: { url: response.result?.mp4 },
        mimetype: 'video/mp4',
        fileName: `${video.title}.mp4`,
        caption: `${video.title}`
      }, { quoted: m });
    }

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, typeof e === 'string' ? e : errorMessage, m);
  }
};

handler.command = ['audio', 'video'];
handler.group = true;

export default handler;
