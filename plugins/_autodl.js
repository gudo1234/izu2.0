import axios from 'axios';
import fetch from 'node-fetch';
import yts from 'yt-search';

const APIS = [
  link => `https://api.neoxr.my.id/api/yta?url=${link}&apikey=your_api_key`,
  link => `https://api-vreden.vercel.app/api/yta?url=${link}`,
  link => `https://api-siputzx.my.id/api/yta?url=${link}&apikey=your_api_key`
];

const sesionesYT = new Map();

function esUrlDeYoutube(texto) {
  return /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]+/.test(texto);
}

function extraerLink(texto) {
  const match = texto.match(/(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]+/);
  return match ? (match[0].startsWith('http') ? match[0] : 'https://' + match[0]) : null;
}

async function obtenerInfo(link) {
  for (const api of APIS) {
    try {
      const res = await axios.get(api(link));
      if (res.data?.status || res.data?.result) {
        return res.data.result || res.data;
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

async function handler(m, { conn, text }) {
  const isAudioVideo = /^(audio|video)$/i.test(m.text);
  const session = sesionesYT.get(m.sender);

  if (isAudioVideo && session) {
    const { info, timeout } = session;
    clearTimeout(timeout);
    sesionesYT.delete(m.sender);

    const formato = m.text.toLowerCase();
    const media = formato === 'audio' ? info.audio : info.video;
    const filename = `${info.title}.${formato === 'audio' ? 'mp3' : 'mp4'}`;
    const mime = formato === 'audio' ? 'audio/mp4' : 'video/mp4';

    if (!media?.url) return m.reply(`No se encontró ${formato} para este enlace.`);

    return conn.sendFile(m.chat, media.url, filename, null, m, false, { mimetype: mime });
  }

  if (esUrlDeYoutube(m.text)) {
    const link = extraerLink(m.text);
    const ytSearch = await yts(link);
    const video = ytSearch?.videos?.[0];

    if (!video) return m.reply('No se pudo encontrar información del video.');

    const info = await obtenerInfo(link);
    if (!info || (!info.audio?.url && !info.video?.url)) {
      return m.reply('No se pudo obtener datos de descarga.');
    }

    const detalles = `*Título:* ${video.title}
*Duración:* ${video.timestamp}
*Publicado:* ${video.ago}
*Vistas:* ${video.views.toLocaleString()}
*Autor:* ${video.author.name}
*Link:* ${video.url}

*¿Qué deseas descargar?*
› Audio (${info.audio?.quality || 'desconocida'}, ${info.audio?.size || '??'})
› Video (${info.video?.quality || 'desconocida'}, ${info.video?.size || '??'})

_Responde con **audio** o **video** para recibir el archivo._`;

    const timeout = setTimeout(() => sesionesYT.delete(m.sender), 2 * 60 * 1000); // 2 minutos
    sesionesYT.set(m.sender, { tipo: 'youtube', info, timeout });

    await conn.sendFile(m.chat, video.thumbnail, 'thumb.jpg', detalles, m);
  }
}

handler.customPrefix = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]+$|^(audio|video)$/i;
handler.command = new RegExp('');

export default handler;
