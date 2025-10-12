import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.sendMessage(m.chat, { text: '⚠️ Ingresa un enlace de YouTube válido.' });
  if (!text.includes('youtube.com') && !text.includes('youtu.be')) {
    return conn.sendMessage(m.chat, { text: '❌ El enlace proporcionado no es válido.' });
  }

  try {
    await m.react('⏳');

    const apiUrl = `https://api-nv.ultraplus.click/api/dl/yt-direct?url=${encodeURIComponent(text)}&format=audio&key=2yLJjTeqXudWiWB8`;

    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': '*/*',
        'Referer': 'https://youtube.com/',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('⚠️ Error en respuesta API:', errorText);
      return conn.sendMessage(m.chat, { text: '❌ Error al obtener el audio. La API no respondió correctamente.' });
    }

    const buffer = Buffer.from(await res.arrayBuffer());

    await conn.sendMessage(
      m.chat,
      {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: 'audio.mp3',
      },
      { quoted: m }
    );

    await m.react('✅');
  } catch (err) {
    console.error('❌ Error en descarga:', err);
    await conn.sendMessage(m.chat, { text: '⚠️ Hubo un error al descargar el audio.' });
  }
};

handler.command = ['youtube', 'yta', 'ytmp3'];
handler.help = ['youtube'];
handler.tags = ['downloader'];

export default handler;
