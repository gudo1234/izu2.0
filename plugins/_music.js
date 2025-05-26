import ytSearch from 'yt-search';
import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*Uso correcto:*\n${usedPrefix + command} <título o enlace de YouTube>`;

  const waitMessage = '⏳ Buscando y procesando el audio...';
  const errorMessage = '❌ Ocurrió un error. Intenta nuevamente más tarde.';
  const apiKey = 'mOpoAHjJ'; // reemplaza con tu API key si es distinta

  try {
    await m.reply(waitMessage);

    const result = await ytSearch(text);
    const video = result.videos[0];
    if (!video) throw '❌ No se encontró ningún video.';
    if (video.seconds >= 3600) throw '❌ El video supera 1 hora de duración.';

    let response;
    try {
      const apiRes = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${video.url}&apikey=${apiKey}`);
      response = await apiRes.json();
    } catch {
      throw errorMessage;
    }

    const caption = `
*∘ Título:* ${video.title}
*∘ Duración:* ${video.timestamp}
*∘ Vistas:* ${video.views.toLocaleString()}
*∘ Subido:* ${video.ago}
*∘ Canal:* ${video.author.name}
*∘ URL:* ${video.url}
`.trim();

    await conn.sendMessage(m.chat, {
      image: { url: video.image },
      caption,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: 'Descarga de audio en curso',
          thumbnailUrl: video.image,
          sourceUrl: video.url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      audio: { url: response.result?.mp3 },
      mimetype: 'audio/mpeg',
      fileName: `${video.title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: '',
          thumbnailUrl: video.image,
          sourceUrl: video.url,
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, typeof e === 'string' ? e : errorMessage, m);
  }
};

handler.command = handler.help = ['play', 'song', 'ds'];
handler.tags = ['downloader'];
handler.exp = 0;
handler.limit = true;
handler.premium = false;

export default handler;
