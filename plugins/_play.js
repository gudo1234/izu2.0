import fetch from 'node-fetch';

let handler = async (m, { text, usedPrefix, command }) => {
  let url = text?.trim();

  // Si no hay texto, intenta detectar si el mensaje es respuesta a otro con un link
  if (!url && m.quoted?.text) url = m.quoted.text.trim();

  if (!url) throw `Usa el comando así:\n${usedPrefix + command} <enlace de YouTube>\nO responde a un mensaje que contenga el enlace.`;

  if (!url.match(/(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i)) {
    throw 'Debes proporcionar un enlace válido de YouTube.';
  }

  try {
    let res = await fetch(`https://bk9.fun/download/ytmp3?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw 'Error al contactar con la API';

    let json = await res.json();
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
    throw 'Ocurrió un error al intentar descargar el audio.';
  }
};


handler.command = ['o']

export default handler;
