import fetch from 'node-fetch';
import yts from 'yt-search';

const tempStorage = new Map();

export async function before(m, { conn }) {
  if (m.fromMe || m.isBot || !m.text) return;

  const text = m.text.trim();

  // === YOUTUBE ===
  if (/youtu\.be|youtube\.com/i.test(text)) {
    await m.react('🕓');

    const match = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
    const videoId = match ? match[1] : null;
    const result = await yts(videoId ? `https://youtu.be/${videoId}` : text);
    const video = videoId ? result.all.find(v => v.videoId === videoId) : result.videos?.[0];
    if (!video?.title) return m.reply('❌ No se encontró el video.');

    const caption = `「✦」Descargando *<${video.title}>*\n` +
      `> ✦ Descripción » *${video.description || 'Desconocido'}*\n` +
      `> ✰ Vistas » *${video.views.toLocaleString()}*\n` +
      `> ⴵ Duración » *${video.timestamp}*\n` +
      `> ✐ Publicación » *${video.ago}*\n` +
      `> ✦ Url » *${video.url}*\n\n` +
      `*_Responde a este mensaje con:_*\n` +
      `> "a" o "audio" → *Audio*\n> "v" o "video" → *Video*\n` +
      `> "adoc" → *Audio (doc)*\n> "vdoc" → *Video (doc)*`;

    const thumb = (await conn.getFile(video.thumbnail))?.data;
    const context = {
      contextInfo: {
        externalAdReply: {
          title: '✧ Youtube • Music ✧',
          body: 'Descarga personalizada',
          mediaType: 1,
          previewType: 0,
          mediaUrl: video.url,
          sourceUrl: video.url,
          thumbnail: thumb,
          renderLargerThumbnail: true,
        },
      },
    };

    tempStorage.set(m.sender, { url: video.url, title: video.title, key: m.key });
    setTimeout(() => tempStorage.delete(m.sender), 2 * 60 * 1000);

    return conn.reply(m.chat, caption, m, context);
  }

  // === RESPUESTA YOUTUBE ===
  if (tempStorage.has(m.sender)) {
    const res = m.text?.toLowerCase();
    if (!['a', 'audio', 'v', 'video', 'adoc', 'vdoc'].includes(res)) return;

    const data = tempStorage.get(m.sender);
    if (!data || !m.quoted || m.quoted.id !== data.key.id) return;

    const isDoc = res.includes('doc');
    const type = res.startsWith('a') ? 'audio' : 'video';

    const apis = {
      audio: [
        `https://api.neoxr.eu/api/youtube?url=${data.url}&type=audio&quality=128kbps&apikey=GataDios`,
        `https://api.siputzx.my.id/api/d/ytmp3?url=${data.url}`
      ],
      video: [
        `https://api.neoxr.eu/api/youtube?url=${data.url}&type=video&quality=360p&apikey=GataDios`,
        `https://api.siputzx.my.id/api/d/ytmp4?url=${data.url}`
      ]
    };

    await m.react('⬇️');
    for (const api of apis[type]) {
      try {
        const res = await fetch(api);
        const json = await res.json();
        const file = json.data?.download || json.data?.dl || json.result?.url || json.data?.url;
        const mime = json.data?.mime || json.mimetype || (type === 'audio' ? 'audio/mpeg' : 'video/mp4');
        if (file) {
          await m.react('✅');
          return await conn.sendFile(m.chat, file, `${data.title}.${mime.split('/')[1]}`, `✅ ${type.toUpperCase()} descargado`, m, null, {
            mimetype: mime,
            asDocument: isDoc
          });
        }
      } catch { continue; }
    }

    return m.reply(`❌ No se pudo descargar el ${type}`);
  }

  // === TIKTOK ===
  if (/tiktok\.com\/@|vt\.tiktok\.com|tiktok\.com\/t\//i.test(text)) {
    await m.react('🕓');
    const apis = [
      `https://api.neoxr.eu/api/dl/tiktok?url=${text}&apikey=GataDios`,
      `https://api.siputzx.my.id/api/d/tiktokdl?url=${text}`
    ];
    for (const api of apis) {
      try {
        const res = await fetch(api);
        const json = await res.json();
        const url = json.data?.url || json.result?.url || json.video;
        if (url) {
          await m.react('✅');
          return await conn.sendFile(m.chat, url, 'tiktok.mp4', '✅ Video descargado de TikTok', m);
        }
      } catch { continue; }
    }
    return m.reply('❌ No se pudo descargar el video de TikTok');
  }

  // === INSTAGRAM / FACEBOOK / THREADS ===
  if (/instagram\.com|facebook\.com|fb\.watch|threads\.net/i.test(text)) {
    await m.react('🕓');
    const apis = [
      `https://api.neoxr.eu/api/social?url=${text}&apikey=GataDios`,
      `https://api.siputzx.my.id/api/d/igdown?url=${text}`
    ];
    for (const api of apis) {
      try {
        const res = await fetch(api);
        const json = await res.json();
        const list = json.data?.media || json.result?.data || [];
        if (Array.isArray(list)) {
          for (const media of list) {
            if (!media.url) continue;
            await conn.sendFile(m.chat, media.url, null, '', m);
          }
          await m.react('✅');
          return;
        }
      } catch { continue; }
    }
    return m.reply('❌ No se pudo descargar el contenido.');
  }

  // === MEDIAFIRE ===
  if (/mediafire\.com/i.test(text)) {
    await m.react('🕓');
    const apis = [
      `https://api.neoxr.eu/api/dl/mediafire?url=${text}&apikey=GataDios`,
      `https://api.siputzx.my.id/api/d/mediafire?url=${text}`
    ];
    for (const api of apis) {
      try {
        const res = await fetch(api);
        const json = await res.json();
        const url = json.data?.url || json.result?.url;
        const filename = json.data?.filename || json.result?.filename;
        const mime = json.data?.mime || 'application/octet-stream';
        if (url) {
          await m.react('✅');
          return await conn.sendFile(m.chat, url, filename, `✅ Descargado desde MediaFire`, m, null, {
            mimetype: mime,
            asDocument: true
          });
        }
      } catch { continue; }
    }
    return m.reply('❌ No se pudo descargar el archivo de MediaFire');
  }
          }
