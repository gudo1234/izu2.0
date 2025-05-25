import fetch from 'node-fetch';

let handler = async (m, { text, usedPrefix, command }) => {
  let url;

  try {
    url = text?.trim();
    if (!url && m.quoted?.text) url = m.quoted.text.trim();

    if (!url) throw `Usa el comando así:\n${usedPrefix + command} <enlace de YouTube>\nO responde a un mensaje que contenga el enlace.`;

    if (!url.match(/(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i)) {
      throw 'Debes proporcionar un enlace válido de YouTube.';
    }
  } catch (e) {
    throw typeof e === 'string' ? e : 'Error al procesar el enlace.';
  }

  let json;
  try {
    const res = await fetch(`https://bk9.fun/download/ytmp3?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
    json = await res.json();
  } catch (e) {
    console.error(e);
    throw 'Error al contactar con la API. Intenta nuevamente más tarde.';
  }

  try {
    if (!json.status || !json.result) throw 'No se pudo obtener el audio.';
    let { title, url: downloadUrl } = json.result;

    await conn.sendMessage(m.chat, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      ptt: false,
      fileName: `${title}.mp3`,
    }, { quoted: m });
  } catch (e) {
    console.error(e);
    throw 'Error al enviar el audio. El archivo podría no estar disponible o ser muy pesado.';
  }
};

handler.command = ['o']

export default handler;
