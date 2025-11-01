import fetch from 'node-fetch';

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!/^https?:\/\//.test(text))
    return conn.reply(
      m.chat,
      `🪴 Ingresa una URL válida de Pinterest.\n\nEjemplo:\n*${usedPrefix + command}* https://www.pinterest.com/pin/123456789012345678/`,
      m
    );

  await m.react('🕒');

  try {
    // Detectar si la URL es de Pinterest y obtener el pinId
    const pinterestMatch = text.match(/pinterest\.[a-z]+\/pin\/(\d+)/i);
    if (!pinterestMatch) return conn.reply(m.chat, `🪴 URL no reconocida como Pinterest.`, m);

    const pinId = pinterestMatch[1];

    // Llamada a la API de Dorratz para obtener información del pin
    const pinApi = `https://api.dorratz.com/v2/pinterest?q=${pinId}`;
    const res = await fetch(pinApi);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0)
      return conn.reply(m.chat, `🪴 No se encontraron videos para este pin.`, m);

    // Tomamos el primer resultado de video
    const video = data.find(i => i.video_url) || data[0];
    if (!video.video_url) return conn.reply(m.chat, `🪴 Este pin no contiene video.`, m);

    await conn.sendMessage(
      m.chat,
      { video: { url: video.video_url }, caption: `🪴 Pinterest Video` },
      { quoted: m }
    );

    await m.react('✅');
  } catch (e) {
    console.error(e);
    await m.react('❌');
    m.reply(`Error: ${e.message}`);
  }
};

handler.command = ['in'];
handler.group = true;

export default handler;
