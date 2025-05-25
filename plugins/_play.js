import fetch from 'node-fetch';

let handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) throw `Usa el comando así:\n${usedPrefix + command} <enlace de YouTube>`;

  const url = args[0];
  if (!url.match(/(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i)) {
    throw 'Debes proporcionar un enlace válido de YouTube.';
  }

  try {
    let res = await fetch(`https://bk9.fun/download/ytmp3?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw 'Error al contactar con la API';

    let json = await res.json();
    if (!json.status || !json.result) throw 'No se pudo obtener el audio.';

    let { title, thumb, url: downloadUrl, size } = json.result;

    await conn.sendMessage(m.chat, {
      image: { url: thumb },
      caption: `*Título:* ${title}\n*Tamaño:* ${size}\n\nEnviando audio...`,
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      document: { url: downloadUrl },
      fileName: `${title}.mp3`,
      mimetype: 'audio/mpeg',
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    throw 'Ocurrió un error al intentar descargar el audio.';
  }
};

handler.command = ['O']
export default handler;
