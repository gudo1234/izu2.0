import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.sendMessage(m.chat, { text: 'Ingresa un enlace de YouTube válido.' });
  if (!text.includes('youtube.com') && !text.includes('youtu.be')) {
    return conn.sendMessage(m.chat, { text: 'El enlace proporcionado no es válido.' });
  }

  try {
    const apiUrl = `https://api-nv.ultraplus.click/api/dl/yt-direct?url=${encodeURIComponent(text)}&format=audio&key=2yLJjTeqXudWiWB8`;
    const res = await fetch(apiUrl);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      return conn.sendMessage(m.chat, { text: '❌ Error al obtener el audio (la API no respondió correctamente).' });
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

  } catch (e) {
    console.error('Error en descarga:', e);
    await conn.sendMessage(m.chat, { text: '❌ Hubo un error al descargar el audio.' });
  }
};

handler.command = ['youtube', 'yta', 'ytmp3']; // puedes poner los que quieras
handler.help = ['youtube'];
handler.tags = ['downloader'];

export default handler;
