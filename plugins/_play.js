import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*Uso incorrecto*\n\nEjemplo:\n${usedPrefix + command} https://youtu.be/dQw4w9WgXcQ`);

  await m.react('🕒');

  try {
    // Llamada a la API de BK9
    const res = await axios.get(`https://bk9.fun/download/ytmp3?url=${encodeURIComponent(text)}`);

    if (!res.data?.status || !res.data?.result?.url) {
      return m.reply('*[❗] Error al obtener el enlace de descarga desde la API BK9.*');
    }

    const { title, thumbnail, url: downloadUrl } = res.data.result;

    const caption = `
🎵 *Título:* ${title}
🔗 *Link:* ${text}
    `.trim();

    // Enviar mensaje con thumbnail y texto
    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption
    }, { quoted: m });

    // Enviar el audio (mp3)
    await conn.sendMessage(m.chat, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m });

    await m.react('✅');

  } catch (e) {
    console.error('Error al acceder a API BK9:', e.response?.data || e.message || e);
    return m.reply('*[❗] Error al acceder a la API BK9.*');
  }
};

handler.command = ['o'];

export default handler;
