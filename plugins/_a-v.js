import fetch from 'node-fetch';
import axios from 'axios';
import yts from 'yt-search';
import tools from '@takanashi-soft/tools';

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!text) {
    m.reply(`${e} Error: No se proporcionó texto.\nEjemplo: ${usedPrefix + command} amorfoda`);
    return;
  }

  let tipo = '';
  if (command === 'audio') tipo = 'audio';
  if (command === 'video') tipo = 'video';

  try {
    const yt_play = await search(args.join(' '));
    const res = yt_play[0];

    let mensaje = `🎧 *Título:* ${res.title}
🕒 *Publicado hace:* ${res.ago}
⏱️ *Duración:* ${res.duration.timestamp}
👀 *Vistas:* ${res.views}
🎤 *Autor:* ${res.author.name}
🆔 *ID:* ${res.videoId}
📄 *Tipo:* ${res.type}
🔗 *URL:* ${res.url}
🌐 *Canal:* ${res.author.url}

🔽 Enviando el ${tipo} solicitado...`.trim();

    await conn.sendMessage(m.chat, { image: { url: res.thumbnail }, caption: mensaje }, { quoted: m });

    if (command === 'audio') {
      try {
        const audiodlp = await tools.downloader.ytmp3(res.url);
        const downloader = audiodlp.download;
        await conn.sendMessage(m.chat, { audio: { url: downloader }, mimetype: "audio/mpeg" }, { quoted: m });
      } catch (e) {
        console.error(e);
        m.reply(`${e} No se pudo enviar el audio. Intenta con otro resultado.`);
      }
    }

    if (command === 'video') {
      try {
        const videodlp = await tools.downloader.ytmp4(res.url);
        const downloader = videodlp.download;
        await conn.sendMessage(m.chat, { video: { url: downloader }, mimetype: "video/mp4" }, { quoted: m });
      } catch (e) {
        console.error(e);
        m.reply(`${e} No se pudo enviar el video. Intenta con otro resultado.`);
      }
    }

  } catch (e) {
    console.error(e);
    m.reply(`${e} No se pudo procesar tu solicitud.`);
  }
};

handler.command = ['audio', 'video'];
handler.group = true;
export default handler;

async function search(query, options = {}) {
  const search = await yts.search({ query, hl: 'es', gl: 'ES', ...options });
  return search.videos;
}

function MilesNumber(number) {
  const exp = /(\d)(?=(\d{3})+(?!\d))/g;
  const rep = '$1.';
  const arr = number.toString().split('.');
  arr[0] = arr[0].replace(exp, rep);
  return arr[1] ? arr.join('.') : arr[0];
}

function secondString(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const dDisplay = d > 0 ? d + (d == 1 ? ' día, ' : ' días, ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? ' hora, ' : ' horas, ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' minuto, ' : ' minutos, ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? ' segundo' : ' segundos') : '';
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

function bytesToSize(bytes) {
  return new Promise((resolve) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return resolve('n/a');
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    resolve(`${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`);
  });
}

const getBuffer = async (url, options) => {
  const res = await axios({
    method: 'get',
    url,
    headers: {
      'DNT': 1,
      'Upgrade-Insecure-Request': 1,
    },
    ...options,
    responseType: 'arraybuffer',
  });
  return res.data;
};
