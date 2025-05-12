import axios from 'axios';
import fetch from 'node-fetch';
import yts from 'yt-search';

export async function before(m, { conn }) {
  if (m.fromMe || m.isBot) return;
  if (!m.text) return;

  const url = m.text.trim();

  // === TikTok ===
  if (/tiktok\.com/i.test(url)) {
    await m.react('🕓');
    const apis = [
      `https://api.neoxr.eu/api/tiktok?url=${url}&apikey=russellxz`,
      `https://api.dorratz.com/v2/tiktok-dl?url=${url}`,
      `https://api.siputzx.my.id/api/d/tiktok?url=${url}`
    ];
    for (const api of apis) {
      try {
        const res = await fetch(api);
        const json = await res.json();
        const video = json.data?.nowm || json.data?.media?.org || json.data?.result?.url;
        if (video) {
          await m.react('✅');
          return await conn.sendFile(m.chat, video, 'tiktok.mp4', '*✅ Aquí tienes tu video de TikTok*', m);
        }
      } catch (e) {}
    }
    return m.reply('❌ No se pudo descargar el video de TikTok');
  }

  // === Instagram ===
  if (/instagram\.com/i.test(url)) {
    await m.react('🕓');
    const apis = [
      `https://api.neoxr.eu/api/instagram?url=${url}&apikey=russellxz`,
      `https://api.siputzx.my.id/api/d/igdl?url=${url}`,
      `https://api.agatz.xyz/api/instagram?url=${url}`
    ];
    for (const api of apis) {
      try {
        const res = await fetch(api);
        const json = await res.json();
        const file = json.data?.[0]?.url || json.result?.url || json.data?.url;
        if (file) {
          const tipo = file.includes('.jpg') ? 'image' : 'video';
          const name = tipo === 'image' ? 'ig.jpg' : 'ig.mp4';
          await m.react('✅');
          return await conn.sendFile(m.chat, file, name, '*✅ Aquí está tu archivo de Instagram*', m);
        }
      } catch (e) {}
    }
    return m.reply('❌ No se pudo descargar de Instagram');
  }

  // === Facebook ===
  if (/facebook\.com|fb\.watch/i.test(url)) {
    await m.react('🕓');
    const apis = [
      `https://api.neoxr.eu/api/facebook?url=${url}&apikey=russellxz`,
      `https://api.agatz.xyz/api/facebook?url=${url}`,
      `https://api.dorratz.com/fbvideo?url=${url}`
    ];
    for (const api of apis) {
      try {
        const res = await fetch(api);
        const json = await res.json();
        const video = json.data?.hd || json.data?.sd || json.result?.hd || json.result?.sd || json.urls?.[0]?.hd;
        if (video) {
          await m.react('✅');
          return await conn.sendFile(m.chat, video, 'fb.mp4', '*✅ Video de Facebook*', m);
        }
      } catch (e) {}
    }
    return m.reply('❌ No se pudo descargar de Facebook');
  }

  // === Threads ===
  if (/threads\.net/i.test(url)) {
    await m.react('🕓');
    const apis = [
      `https://api.neoxr.eu/api/threads?url=${url}&apikey=russellxz`,
      `https://api.agatz.xyz/api/threads?url=${url}`,
      `https://api.siputzx.my.id/api/d/threads?url=${url}`
    ];
    for (const api of apis) {
      try {
        const res = await fetch(api);
        const json = await res.json();
        const file = json.data?.video_urls?.[0] || json.data?.image_urls?.[0] || json.data?.[0]?.url;
        if (file) {
          const tipo = file.includes('.jpg') || file.includes('.png') ? 'image' : 'video';
          const name = tipo === 'image' ? 'thread.jpg' : 'thread.mp4';
          await m.react('✅');
          return await conn.sendFile(m.chat, file, name, '*✅ Archivo de Threads*', m);
        }
      } catch (e) {}
    }
    return m.reply('❌ No se pudo descargar de Threads');
  }

  // === MediaFire ===
  if (/mediafire\.com/i.test(url)) {
    await m.react('🕓');
    const apis = [
      `https://api.neoxr.eu/api/mediafire?url=${url}&apikey=russellxz`,
      `https://api.agatz.xyz/api/mediafire?url=${url}`,
      `https://api.siputzx.my.id/api/d/mediafire?url=${url}`
    ];
    for (const api of apis) {
      try {
        const res = await fetch(api);
        const json = await res.json();
        const data = json.data?.[0] || json.result || json.data;
        if (data?.link || data?.url) {
          await m.react('✅');
          return await conn.sendFile(
            m.chat,
            data.link || data.url,
            data.nama || data.filename,
            '',
            m,
            null,
            { mimetype: data.mime || data.mimetype, asDocument: true }
          );
        }
      } catch (e) {}
    }
    return m.reply('❌ No se pudo descargar de MediaFire');
  }

  // === YouTube ===
  const tempStorage = new Map(); // Este mapa deberías moverlo fuera de la función si deseas que persista

  if (/youtu\.be|youtube\.com/i.test(url)) {
    await m.react('🕓');

    const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/;
    const videoIdToFind = url.match(youtubeRegexID);

    let videoId;
    let ytSearchResults = await yts(videoIdToFind ? 'https://youtu.be/' + videoIdToFind[1] : url);
    let ytVideo = ytSearchResults.all?.[0] || ytSearchResults.videos?.[0];

    if (videoIdToFind) {
      videoId = videoIdToFind[1];
      ytVideo = ytSearchResults.all.find(v => v.videoId === videoId) || ytSearchResults.videos.find(v => v.videoId === videoId) || ytVideo;
    }

    if (!ytVideo?.title) {
      const fallbackApis = [
        [`https://api.vreden.my.id/api/ytmp3?url=${url}`, res => res?.result?.metadata?.title],
        [`https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(url)}&type=audio&quality=128kbps&apikey=GataDios`, res => res?.title],
        [`https://api.siputzx.my.id/api/d/ytmp3?url=${url}`, res => res?.data?.title]
      ];

      for (const [api, extractTitle] of fallbackApis) {
        try {
          const res = await fetch(api).then(r => r.json());
          const title = extractTitle(res);
          if (title) {
            const search = await yts(title);
            ytVideo = search.all?.[0] || search.videos?.[0];
            break;
          }
        } catch {}
      }
    }

    const caption = `「✦」Descargando *<${ytVideo?.title || 'Desconocido'}>*\n> ✦ Descripción » *${ytVideo?.description || 'Desconocido'}*\n> ✰ Vistas » *${formatViews(ytVideo?.views) || 'Desconocido'}*\n> ⴵ Duración » *${ytVideo?.timestamp || 'Desconocido'}*\n> ✐ Publicación » *${ytVideo?.ago || 'Desconocido'}*\n> ✦ Url » *${ytVideo?.url.replace(/^https:\/\//, "")}*\n\n*_Para seleccionar, responde a este mensaje:_*\n> "a" o "audio" → *Audio*\n> "v" o "video" → *Video*\n> "adoc" → *Audio (doc)*\n> "vdoc" → *Video (doc)*`.trim();

    const thumb = (await conn.getFile(ytVideo.thumbnail))?.data;
    const JT = {
      contextInfo: {
        externalAdReply: {
          title: '✧ Youtube • Music ✧',
          body: 'Youtube',
          mediaType: 1,
          previewType: 0,
          mediaUrl: ytVideo.url,
          sourceUrl: ytVideo.url,
          thumbnail: thumb,
          renderLargerThumbnail: true,
        },
      },
    };

    tempStorage.set(m.sender, {
      url: ytVideo.url,
      title: ytVideo.title,
      resp: m
    });

    setTimeout(() => tempStorage.delete(m.sender), 2 * 60 * 1000);
    return await conn.reply(m.chat, caption, m, JT);
  }

  // === Respuesta del usuario a YouTube ===
  if (m.quoted && m.quoted.sender && m.quoted.sender === conn.user.jid) {
    const text = m.text.trim().toLowerCase();
    if (!['a', 'audio', 'v', 'video', 'adoc', 'vdoc'].includes(text)) return;

    const data = tempStorage.get(m.sender);
    if (!data) return;

    const audioTypes = { a: 'audio', audio: 'audio', adoc: 'document' };
    const videoTypes = {
      v: { type: 'video', caption: true },
      video: { type: 'video', caption: true },
      vdoc: { type: 'document', caption: false }
    };

    if (text in audioTypes) {
      await conn.reply(m.chat, `*${audioTypes[text] === 'document' ? 'Enviando Documento de Audio...' : 'Enviando Audio...'}*`, data.resp);
      const apis = [
        [`https://api.vreden.my.id/api/ytmp3?url=${data.url}`, res => res?.result?.download?.url],
        [`https://api.neoxr.eu/api/youtube?url=${data.url}&type=audio&quality=128kbps&apikey=GataDios`, res => res?.data?.url],
        [`https://api.siputzx.my.id/api/d/ytmp3?url=${data.url}`, res => res?.data?.dl]
      ];

      for (const [api, getUrl] of apis) {
        try {
          const res = await fetch(api).then(r => r.json());
          const dl = getUrl(res);
          if (dl) {
            const isDoc = text === 'adoc';
            return await conn.sendMessage(m.chat, {
              document: { url: dl },
              fileName: `${data.title}.mp3`,
              mimetype: 'audio/mpeg'
            }, { quoted: data.resp });
          }
        } catch {}
      }

      return m.reply('❌ No se pudo obtener el audio.');
    }

    // Lógica para video si es necesario...
  }
}
