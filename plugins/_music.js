import fetch from 'node-fetch';

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `✦ Ingresa una URL de YouTube.\n\nEjemplo:\n${usedPrefix + command} https://youtu.be/dQw4w9WgXcQ`, m);
  }

  const ytUrl = text.trim();
  const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i;
  if (!ytRegex.test(ytUrl)) {
    return conn.reply(m.chat, '❌ URL no válida de YouTube.', m);
  }

  m.react('🎧');

  try {
    const api = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(ytUrl)}&type=video&quality=480p&apikey=GataDios`;
    const res = await fetch(api);
    if (!res.ok) throw new Error('❌ Error al contactar la API.');

    const json = await res.json();
    const audioUrl = json?.data?.audio;

    if (!audioUrl) {
      return conn.reply(m.chat, '❌ No se pudo obtener el audio del video.', m);
    }

    const title = json.data.title || 'Audio de YouTube';

    await conn.sendFile(m.chat, audioUrl, 'audio.mp3', `🎵 *${title}*`, m, null, {
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    });

    await m.react('✅');

  } catch (e) {
    console.error('[ERROR MUSIC]', e);
    conn.reply(m.chat, '❌ Error al procesar el audio. Intenta con otro enlace.', m);
  }
};

handler.command = ['music'];
handler.group = true;

export default handler;
