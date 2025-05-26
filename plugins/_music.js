import fetch from 'node-fetch';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

const handler = async (m, { args, conn, usedPrefix, command }) => {
  let url = args[0];
  if (!url || !url.match(/(youtu\.be|youtube\.com)/gi)) {
    return m.reply(`*Ejemplo de uso:*\n${usedPrefix + command} https://youtube.com/watch?v=VSL5F43qgng`);
  }

  try {
    let apikey = 'mOpoAHjJ';
    let api = `https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(url)}&apikey=${apikey}`;

    let res = await fetch(api);
    let json = await res.json();

    if (!json || !json.result || !json.result.audio) {
      return m.reply('No se pudo obtener el audio.');
    }

    const { title, thumb, audio, size } = json.result;

    await conn.sendMessage(m.chat, {
      image: { url: thumb },
      caption: `*Título:* ${title}\n*Tamaño:* ${size}`,
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      audio: { url: audio },
      mimetype: 'audio/mp4'
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('Ocurrió un error al procesar tu solicitud.');
  }
};

handler.command = ['music']
export default handler;
