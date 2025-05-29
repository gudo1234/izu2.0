import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`${e} *Debes escribir el nombre de una canción o artista!*\n\n📌 *Ejemplo:* ${usedPrefix + command} diles`);
  }

  await m.react('🕒');

  try {
    const res = await fetch(`https://velyn.biz.id/api/search/spotify?query=${encodeURIComponent(text)}`);
    const data = await res.json();

    if (!data || !data.result || data.result.length === 0) {
      return m.reply(`${e} No se encontraron resultados en Spotify.`);
    }

    const results = data.result.slice(0, 5);
    for (const song of results) {
      const caption = `
🎧 *${song.name}*
👤 *Artista:* ${song.artists}
💽 *Álbum:* ${song.album}
⏱️ *Duración:* ${song.duration}
🔗 *Link:* ${song.url}
`.trim();

      await conn.sendMessage(m.chat, {
        image: { url: song.image },
        caption,
        contextInfo: {
          externalAdReply: {
            title: wm,
            body: textbot,
            thumbnailUrl: redes,
            thumbnail: song.image,
            mediaType: 1,
            renderLargerThumbnail: true,
            sourceUrl: redes
          }
        }
      }, { quoted: m });
    }

    await m.react('✅');
  } catch (err) {
    console.error('Error en Spotify:', err);
    m.reply(`${e} Error al buscar en Spotify: ${err.message}`);
  }
};

handler.command = ['spotify', 'spoty', 'song'];
handler.group = true;

export default handler;
