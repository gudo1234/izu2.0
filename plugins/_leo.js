/*import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, '❀ Ingresa una URL de TikTok', m);
  }
  const urlPattern = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com\/@[\w.-]+\/video\/\d+|tiktok\.com\/t\/[\w.-]+|vm\.tiktok\.com\/[\w.-]+|vt\.tiktok\.com\/[\w.-]+)/i;

  if (!urlPattern.test(text)) {
    return conn.reply(m.chat, '✗ La URL proporcionada no es válida para TikTok', m);
  }

  m.react('🕒');

  try {
    const apiUrl = `https://api.dorratz.com/v2/tiktok-dl?url=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    
    if (!res.ok) throw new Error('Fallo al obtener respuesta de la API.');

    const json = await res.json();

    if (!json.data || !json.data.media || !json.data.media.org) {
      throw new Error('La API no devolvió un video válido.');
    }

    const video = json.data;
    const txt = `*「✦」Título:* ${video.title || 'Sin título'}

> *✦ Autor:* » ${video.author?.nickname || 'Desconocido'}
> *ⴵ Duración:* » ${video.duration ? `${video.duration} segundos` : 'No especificado'}
> *🜸 Likes:* » ${video.like || 0}
> *✎ Comentarios:* » ${video.comment || 0}`;

    m.react('✅');
    await conn.sendFile(m.chat, video.media.org, 'tiktok.mp4', txt, m);
  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, 'Ocurrió un error al intentar descargar el video. Intenta nuevamente más tarde.', m);
  }
};

handler.command = ['leo'];
export default handler;*/

import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, '❀ Ingresa una URL de TikTok', m);

  const urlPattern = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com\/@[\w.-]+\/video\/\d+|tiktok\.com\/t\/[\w.-]+|vm\.tiktok\.com\/[\w.-]+|vt\.tiktok\.com\/[\w.-]+)/i;
  if (!urlPattern.test(text)) return conn.reply(m.chat, '✗ La URL proporcionada no es válida para TikTok', m);

  m.react('🕒');

  try {
    const apiUrl = `https://api.dorratz.com/v2/tiktok-dl?url=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('Fallo al obtener respuesta de la API.');

    const json = await res.json();
    const video = json.data;

    if (!video || !video.media) throw new Error('La API no devolvió datos válidos.');

    const txt = `*「✦」Título:* ${video.title || 'Sin título'}\n\n` +
                `> *✦ Autor:* » ${video.author?.nickname || 'Desconocido'}\n` +
                `> *ⴵ Duración:* » ${video.duration ? `${video.duration} segundos` : 'No especificado'}\n` +
                `> *🜸 Likes:* » ${video.like || 0}\n` +
                `> *✎ Comentarios:* » ${video.comment || 0}`;

    m.react('✅');

    if (video.type === 'image' && video.image.length === 1) {
      // Imagen única con audio
      await conn.sendFile(m.chat, video.image[0], 'photo.jpg', txt, m);
      if (video.audio) await conn.sendFile(m.chat, video.audio, 'audio.mp3', '', m);
    } else if (video.type === 'image' && video.image.length > 1) {
      // Carrusel de imágenes con audio aparte
      for (const img of video.image) {
        await conn.sendFile(m.chat, img, 'photo.jpg', '', m);
      }
      if (video.audio) await conn.sendFile(m.chat, video.audio, 'audio.mp3', txt, m);
    } else {
      // Video normal
      await conn.sendFile(m.chat, video.media.org, 'tiktok.mp4', txt, m);
    }

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, 'Ocurrió un error al intentar descargar el contenido. Intenta nuevamente más tarde.', m);
  }
};

handler.command = ['leo'];
export default handler;
