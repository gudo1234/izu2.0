import fetch from 'node-fetch';

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!/^https?:\/\//.test(text))
    return conn.reply(
      m.chat,
      `🪴 Ingresa una URL de Pinterest válida.\n\nEjemplo:\n*${usedPrefix + command}* https://www.pinterest.com/pin/123456789012345678/`,
      m
    );

  await m.react('🕒');

  try {
    // Detectar pinId de la URL
    const pinMatch = text.match(/pinterest\.[a-z]+\/pin\/(\d+)/i);
    if (!pinMatch) return conn.reply(m.chat, `🪴 URL no reconocida como Pinterest.`, m);

    const pinId = pinMatch[1];

    // Obtener datos del pin desde la API oficial de Pinterest
    const pinApi = `https://api.pinterest.com/v3/pidgets/pins/info/?pin_ids=${pinId}`;
    const pinRes = await fetch(pinApi);
    const pinJson = await pinRes.json();
    const pinData = pinJson.data[pinId];

    if (!pinData) return conn.reply(m.chat, `🪴 No se pudo obtener información del pin.`, m);

    // Si hay video en el pin
    if (pinData.videos?.video_list) {
      const videoKeys = Object.keys(pinData.videos.video_list);
      const videoUrl = pinData.videos.video_list[videoKeys[0]].url;
      await conn.sendMessage(m.chat, { video: { url: videoUrl }, caption: `🪴 Pinterest Video` }, { quoted: m });
    } else {
      return conn.reply(m.chat, `🪴 Este pin no contiene video.`, m);
    }

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
