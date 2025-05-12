import axios from 'axios';
import fetch from 'node-fetch';
import yts from 'yt-search';

const tempStorage = new Map();

export async function before(m, { conn }) {
  if (m.fromMe || m.isBot) return;
  if (!m.text) return;

  const text = m.text.trim();

  // === Manejo de descarga YouTube tras selección ===
  if (tempStorage.has(m.sender)) {
    if (!m.quoted || m.quoted.sender !== conn.user.jid) return;

    const choice = text.toLowerCase();
    const data = tempStorage.get(m.sender);
    const url = data.url;

    let api = '', filename = '', asDoc = false;

    if (choice === 'a' || choice === 'audio') {
      api = `https://api.neoxr.eu/api/youtube?url=${url}&type=audio&quality=128kbps&apikey=GataDios`;
      filename = 'audio.mp3';
    } else if (choice === 'v' || choice === 'video') {
      api = `https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=360p&apikey=GataDios`;
      filename = 'video.mp4';
    } else if (choice === 'adoc') {
      api = `https://api.neoxr.eu/api/youtube?url=${url}&type=audio&quality=128kbps&apikey=GataDios`;
      filename = 'audio.mp3';
      asDoc = true;
    } else if (choice === 'vdoc') {
      api = `https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=360p&apikey=GataDios`;
      filename = 'video.mp4';
      asDoc = true;
    } else return;

    try {
      const res = await fetch(api);
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
      const json = await res.json();

      const dl = json.data?.download || json.data?.dl || json.data?.downloadUrl || json.result?.url;
      const mime = json.data?.mime || json.result?.mimetype || undefined;

      if (dl) {
        await conn.sendFile(m.chat, dl, filename, `✅ Aquí tienes tu ${choice}`, m, null, {
          mimetype: asDoc ? undefined : mime,
          asDocument: asDoc
        });
        tempStorage.delete(m.sender);
      } else {
        m.reply('❌ No se encontró el archivo para descargar.');
      }
    } catch (e) {
      console.error('Error al procesar YouTube:', e);
      m.reply(`❌ Error al descargar: ${e.message}`);
    }
    return;
  }

  // === YouTube búsqueda inicial ===
  if (/youtu.be|youtube.com/i.test(text)) {
    await m.react('🕓');
    const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/;
    let videoIdToFind = text.match(youtubeRegexID);
    let videoId;

    let ytplay2;
    try {
      ytplay2 = await yts(videoIdToFind ? 'https://youtu.be/' + videoIdToFind[1] : text);
    } catch (e) {
      console.error('Error en yts búsqueda:', e);
      m.reply(`❌ Error en la búsqueda de YouTube: ${e.message}`);
      return;
    }

    if (videoIdToFind) {
      videoId = videoIdToFind[1];
      ytplay2 = ytplay2.all.find(v => v.videoId === videoId) || ytplay2.videos.find(v => v.videoId === videoId);
    }
    ytplay2 = ytplay2?.all?.[0] || ytplay2?.videos?.[0] || ytplay2;

    if (!ytplay2?.title) {
      let title = null;
      try {
        const res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${text}`);
        const data = await res.json();
        title = data?.result?.metadata?.title;
      } catch (e) {
        console.error('Error en la API Vreden:', e);
      }
      if (!title) {
        try {
          const res = await fetch(`https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(text)}&type=audio&quality=128kbps&apikey=GataDios`);
          const data = await res.json();
          title = data?.title;
        } catch (e) {
          console.error('Error en la API Neoxr:', e);
        }
      }
      if (!title) {
        try {
          const res = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${text}`);
          const data = await res.json();
          title = data?.data?.title;
        } catch (e) {
          console.error('Error en la API Siputzx:', e);
        }
      }
      if (title) {
        let yt_play;
        try {
          yt_play = await yts(title);
          ytplay2 = yt_play?.all?.[0] || yt_play?.videos?.[0] || ytplay2;
          if (videoIdToFind) {
            videoId = videoIdToFind[1];
            ytplay2 = yt_play.all.find(v => v.videoId === videoId) || yt_play.videos.find(v => v.videoId === videoId) || ytplay2;
          }
        } catch (e) {
          console.error('Error en yts al buscar por título:', e);
          m.reply(`❌ Error al buscar el video con el título: ${e.message}`);
          return;
        }
      }
    }

    const caption = `「✦」Descargando *<${ytplay2?.title || 'Desconocido'}>*\n> ✦ Descripción » *${ytplay2?.description || 'Desconocido'}*\n> ✰ Vistas » *${formatViews(ytplay2?.views) || 'Desconocido'}*\n> ⴵ Duración » *${ytplay2?.timestamp || 'Desconocido'}*\n> ✐ Publicación » *${ytplay2?.ago || 'Desconocido'}*\n> ✦ Url » *${ytplay2?.url.replace(/^https:\/\//, "")}*\n\n*_Para seleccionar, responde a este mensaje con:_*\n> "a" o "audio" → *Audio*\n> "v" o "video" → *Video*\n> "adoc" → *Audio (doc)*\n> "vdoc" → *Video (doc)*`.trim();

    const thumb = (await conn.getFile(ytplay2.thumbnail))?.data;
    const JT = {
      contextInfo: {
        externalAdReply: {
          title: '✧ Youtube • Music ✧',
          body: "Bot",
          mediaType: 1,
          previewType: 0,
          mediaUrl: ytplay2.url,
          sourceUrl: ytplay2.url,
          thumbnail: thumb,
          renderLargerThumbnail: true,
        },
      },
    };

    tempStorage.set(m.sender, { url: ytplay2.url });
    await conn.reply(m.chat, caption, m, JT);
    return;
  }
}

// Formatea vistas con notación abreviada
function formatViews(views) {
  if (!views) return '0';
  const si = [
    { v: 1E9, s: "B" },
    { v: 1E6, s: "M" },
    { v: 1E3, s: "K" }
  ];
  for (const { v, s } of si) {
    if (views >= v) return (views / v).toFixed(1) + s;
  }
  return views.toString();
        }
