import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    const example = `${usedPrefix}${command} https://vt.tiktok.com/ZShhtdsRh/`;
    return conn.reply(m.chat, `*Ejemplo:* ${example}`, m);
  }

  try {
    await m.react('🕒');

    // Llamada a la API de descarga de TikTok
    const apiUrl = 'https://api.dorratz.com/v2/tiktok-dl';
    const { data } = await axios.get(apiUrl, { params: { url: text } });

    // Verificar estructura de la respuesta
    if (!data || !data.video || !data.video.play) {
      throw new Error('Respuesta inesperada de la API');
    }

    // Extraer datos
    const videoUrl       = data.video.play;                    // URL del vídeo sin marca
    const videoTitle     = data.music?.title     || 'Desconocido';
    const videoAuthor    = data.author?.nickname || 'Desconocido';
    const videoDuration  = data.video.duration   || 0;         // en segundos
    const videoLikes     = data.stats?.diggCount    || 0;
    const videoComments  = data.stats?.commentCount || 0;

    // Construir texto de mensaje
    const infoText = 
      `*Título:* ${videoTitle}\n` +
      `*Autor:* ${videoAuthor}\n` +
      `*Duración:* ${videoDuration}s\n` +
      `*Likes:* ${videoLikes}\n` +
      `*Comentarios:* ${videoComments}`;

    await m.react('✅');
    // Enviar el archivo de vídeo
    await conn.sendFile(m.chat, videoUrl, 'tiktok.mp4', infoText, m);

  } catch (err) {
    console.error(err);
    await m.react('❌');
    conn.reply(m.chat, '❗️Error al descargar el video. Verifica la URL e intenta de nuevo.', m);
  }
};

handler.command = ['leo'];
//handler.group = true;
export default handler;
