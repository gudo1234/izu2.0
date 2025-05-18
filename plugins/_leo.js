/*import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    const example = `${usedPrefix}${command} https://vm.tiktok.com/ZMjdrFCtg/`;
    return conn.reply(m.chat, `⚠️ *Ejemplo de uso:*\n📌 ${example}`, m);
  }

  // Validar URL sencilla
  const urlPattern = /^https?:\/\/(www\.)?tiktok\.com\/.+|https?:\/\/vm\.tiktok\.com\/.+/i;
  if (!urlPattern.test(text)) {
    return conn.reply(m.chat, '❌ *Enlace de TikTok inválido.*', m);
  }

  try {
    // ⏱️ Reacción de carga
    await m.react('⏱️');

    // Llamada a la API de descarga de TikTok
    const apiUrl = `https://api.dorratz.com/v2/tiktok-dl?url=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    const json = await res.json();

    // Validar respuesta
    if (!json.data || !json.data.media || !json.data.media.org) {
      throw new Error('La API no devolvió un video válido.');
    }

    const videoData     = json.data;
    const videoUrl      = videoData.media.org;
    const videoTitle    = videoData.title      || 'Sin título';
    const videoAuthor   = videoData.author?.nickname || 'Desconocido';
    const videoDuration = videoData.duration   ? `${videoData.duration} segundos` : 'No especificado';
    const videoLikes    = videoData.like       || 0;
    const videoComments = videoData.comment    || 0;

    // Construir caption
    const caption = 
      `🎥 *Video de TikTok* 🎥\n\n` +
      `📌 *Título:* ${videoTitle}\n` +
      `👤 *Autor:* ${videoAuthor}\n` +
      `⏱️ *Duración:* ${videoDuration}\n` +
      `❤️ *Likes:* ${videoLikes} | 💬 *Comentarios:* ${videoComments}\n\n` +
      `───────\n` +
      `🍧 *API utilizada:* https://api.dorratz.com\n` +
      `© Azura Ultra & Cortana`;

    // Enviar video
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption
    }, { quoted: m });

    // ✅ Reacción de éxito
    await m.react('✅');

  } catch (err) {
    console.error('❌ Error en el comando .tiktok:', err.message);
    await m.react('❌');
    conn.reply(m.chat, '❌ *Ocurrió un error al procesar el enlace de TikTok.*\n🔹 _Inténtalo más tarde._', m);
  }
};

handler.command = ['leo'];
//handler.group = true;
export default handler;*/

import fetch from 'node-fetch';
const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `Ingese una url de tiktok`, m);
  }
  const urlPattern = /^https?:\/\/(www\.)?tiktok\.com\/.+|https?:\/\/vm\.tiktok\.com\/.+/i;
  if (!urlPattern.test(text)) {
    return conn.reply(m.chat, `Url no válido para tiktok `, m);
  }
 m.react('🕒');
    const apiUrl = `https://api.dorratz.com/v2/tiktok-dl?url=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    const json = await res.json();
    if (!json.data || !json.data.media || !json.data.media.org) {
      throw new Error('La API no devolvió un video válido.');
    }
    const videoData     = json.data;
    const videoUrl      = videoData.media.org;
    const videoTitle    = videoData.title      || 'Sin título';
    const videoAuthor   = videoData.author?.nickname || 'Desconocido';
    const videoDuration = videoData.duration   ? `${videoData.duration} segundos` : 'No especificado';
    const videoLikes    = videoData.like       || 0;
    const videoComments = videoData.comment    || 0;
    let txt = `*Título:* ${videoTitle}
*Autor:* ${videoAuthor}
*Duración:* ${videoDuration}
*Likes:* ${videoLikes}
*Comentarios:* ${videoComments}`
m.react('✅');
await conn.sendFile(m.chat, videoUrl, 'tiktok.mp4', txt, m)
}

handler.command = ['leo', 'l'];
export default handler;
