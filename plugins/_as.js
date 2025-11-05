import play from 'play-dl';
import yts from 'yt-search';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `✳️ Usa el comando así:\n\n${usedPrefix + command} mi canción`, m);

  try {
    const search = await yts(text);
    const video = search.videos[0];
    if (!video) return conn.reply(m.chat, '❌ No encontré ningún resultado.', m);

    const { title, timestamp, views, author, url } = video;

    const info = `
🎵 *Título:* ${title}
📺 *Canal:* ${author.name}
👀 *Vistas:* ${views.toLocaleString()}
⏱️ *Duración:* ${timestamp}
🔗 *Enlace:* ${url}
    `.trim();

    await conn.reply(m.chat, info, m);

    // Obtener el stream de audio
    const stream = await play.stream(url);

    await conn.sendMessage(
      m.chat,
      { audio: { stream: stream.stream, mimetype: 'audio/mpeg', fileName: `${title}.mp3` } },
      { quoted: m }
    );

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, '❌ Ocurrió un error al procesar la canción.', m);
  }
};

handler.command = ['pa'];
export default handler;
