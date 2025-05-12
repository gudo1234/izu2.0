import axios from 'axios';
import fetch from 'node-fetch';
import yts from 'yt-search';

const tempStorage = new Map(); // Mapa para almacenamiento temporal

export async function before(m, { conn }) {
  if (m.fromMe || m.isBot) return;
  //if (!db.data.chats[m.chat].autodl && m.isGroup) return;
  if (!m.text) return;
  let text = m.text.trim();

  // === Detectar respuesta para descarga YouTube ===
  if (text && tempStorage.has(m.sender)) {
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
      const json = await res.json();  
      const dl = json.data?.download || json.data?.dl || json.data?.downloadUrl;  
      if (dl) {  
        await conn.sendFile(m.chat, dl, filename, `✅ Aquí tienes tu ${choice}`, m, null, {  
          mimetype: asDoc ? undefined : json.data?.mime,  
          asDocument: asDoc  
        });  
        tempStorage.delete(m.sender);  
      } else {  
        m.reply('❌ No se pudo descargar el archivo.');  
      }  
    } catch (e) {  
      console.error(e);  
      m.reply('❌ Error al descargar el archivo.');  
    }  
    return;
  }

  // === TikTok ===
  if (/tiktok.com/i.test(text)) {
    await m.react('🕓');
    const apis = [
      `https://api.neoxr.eu/api/tiktok?url=${text}&apikey=russellxz`,
      `https://api.dorratz.com/v2/tiktok-dl?url=${text}`,
      `https://api.siputzx.my.id/api/d/tiktok?url=${text}`
    ];
    for (const api of apis) {
      try {
        const res = await fetch(api);
        const json = await res.json();
        const video = json.data?.nowm || json.data?.media?.org || json.data?.result?.url;
        await m.react('✅');
        if (video) return await conn.sendFile(m.chat, video, 'tiktok.mp4', '✅ Aquí tienes tu video de TikTok', m);
      } catch (e) { continue; }
    }
    return m.reply('❌ No se pudo descargar el video de TikTok');
  }

  // === Instagram ===
  if (/instagram.com/i.test(text)) {
    await m.react('🕓');
    const apis = [
      `https://api.neoxr.eu/api/instagram?url=${text}&apikey=russellxz`,
      `https://api.siputzx.my.id/api/d/igdl?url=${text}`,
      `https://api.agatz.xyz/api/instagram?url=${text}`
    ];
    for (const api of apis) {
      try {
        const res = await fetch(api);
        const json = await res.json();
        const file = json.data?.[0]?.url || json.result?.url || json.data?.url;
        const tipo = file.includes('.jpg') ? 'image' : 'video';
        const name = tipo === 'image' ? 'ig.jpg' : 'ig.mp4';
        await m.react('✅');
        return await conn.sendFile(m.chat, file, name, '✅ Aquí está tu archivo de Instagram', m);
      } catch (e) { continue; }
    }
    return m.reply('❌ No se pudo descargar de Instagram');
  }

  // === Facebook ===
  if (/facebook.com|fb.watch/i.test(text)) {
    await m.react('🕓');
    const apis = [
      `https://api.neoxr.eu/api/facebook?url=${text}&apikey=russellxz`,
      `https://api.agatz.xyz/api/facebook?url=${text}`,
      `https://api.dorratz.com/fbvideo?url=${text}`
    ];
    for (const api of apis) {
      try {
        const res = await fetch(api);
        const json = await res.json();
        const video = json.data?.hd || json.data?.sd || json.result?.hd || json.result?.sd || json.urls?.[0]?.hd;
        await m.react('✅');
        if (video) return await conn.sendFile(m.chat, video, 'fb.mp4', '✅ Video de Facebook', m);
      } catch (e) { continue; }
    }
    return m.reply('❌ No se pudo descargar de Facebook');
  }

  // === Threads ===
  if (/threads.net/i.test(text)) {
    await m.react('🕓');
    const apis = [
      `https://api.neoxr.eu/api/threads?url=${text}&apikey=russellxz`,
      `https://api.agatz.xyz/api/threads?url=${text}`,
      `https://api.siputzx.my.id/api/d/threads?url=${text}`
    ];
    for (const api of apis) {
      try {
        const res = await fetch(api);
        const json = await res.json();
        const file = json.data?.video_urls?.[0] || json.data?.image_urls?.[0] || json.data?.[0]?.url;
        const tipo = file.includes('.jpg') || file.includes('.png') ? 'image' : 'video';
        const name = tipo === 'image' ? 'thread.jpg' : 'thread.mp4';
        await m.react('✅');
        return await conn.sendFile(m.chat, file, name, '✅ Archivo de Threads', m);
      } catch (e) { continue; }
    }
    return m.reply('❌ No se pudo descargar de Threads');
  }

  // === Mediafire ===
  if (/mediafire.com/i.test(text)) {
    await m.react('🕓');
    const apis = [
      `https://api.neoxr.eu/api/mediafire?url=${text}&apikey=russellxz`,
      `https://api.agatz.xyz/api/mediafire?url=${text}`,
      `https://api.siputzx.my.id/api/d/mediafire?url=${text}`
    ];
    for (const api of apis) {
      try {
        const res = await fetch(api);
        const json = await res.json();
        const data = json.data?.[0] || json.result || json.data;
        if (data?.link || data?.url) {
          await m.react('✅');
          return await conn.sendFile(m.chat, data.link || data.url, data.nama || data.filename, '', m, null, {
            mimetype: data.mime || data.mimetype,
            asDocument: true
          });
        }
      } catch (e) { continue; }
    }
    return m.reply('❌ No se pudo descargar de MediaFire');
  }

  // === YouTube ===
  if (/youtu.be|youtube.com/i.test(text)) {
    await m.react('🕓');

    const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/;  
    let videoIdToFind = text.match(youtubeRegexID);  
    let videoId;  

    let ytplay2 = await yts(videoIdToFind ? 'https://youtu.be/' + videoIdToFind[1] : text);  

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
      } catch {}
      if (!title) {
        try {
          const res = await fetch(`https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(text)}&type=audio&quality=128kbps&apikey=GataDios`);
          const data = await res.json();
          title = data?.title;
        } catch {}
      }
      if (!title) {
        try {
          const res = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${text}`);
          const data = await res.json();
          title = data?.data?.title;
        } catch {}
      }
      if (title) {
        let yt_play = await yts(title);
        ytplay2 = yt_play?.all?.[0] || yt_play?.videos?.[0] || yt_play;
        if (videoIdToFind) {
          videoId = videoIdToFind[1];
          ytplay2 = yt_play.all.find(v => v.videoId === videoId) || yt_play.videos.find(v => v.videoId === videoId) || ytplay2;
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

// Función para dar formato a vistas
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
