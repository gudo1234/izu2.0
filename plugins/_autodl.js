import axios from 'axios';
import fetch from 'node-fetch';
import yts from 'yt-search'

export async function before(m, { conn }) {
  if (m.fromMe || m.isBot) return
  //if (!db.data.chats[m.chat].autodl && m.isGroup) return
  if (!m.text) return;
  let text = m.text
  const url = m.text.trim();

  // === TikTok ===
  if (/tiktok\.com/i.test(url)) {
    await m.react('🕓')
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
        await m.react('✅')
        if (video) return await conn.sendFile(m.chat, video, 'tiktok.mp4', '*✅ Aquí tienes tu video de TikTok*', m);
      } catch (e) { continue; }
    }
    return m.reply('❌ No se pudo descargar el video de TikTok');
  }

  // === Instagram ===
  if (/instagram\.com/i.test(url)) {
    await m.react('🕓')
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
        const tipo = file.includes('.jpg') ? 'image' : 'video';
        const name = tipo === 'image' ? 'ig.jpg' : 'ig.mp4';
        await m.react('✅')
        return await conn.sendFile(m.chat, file, name, '*✅ Aquí está tu archivo de Instagram*', m);
      } catch (e) { continue; }
    }
    return m.reply('❌ No se pudo descargar de Instagram');
  }

  // === Facebook ===
  if (/facebook\.com|fb\.watch/i.test(url)) {
    await m.react('🕓')
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
        await m.react('✅')
        if (video) return await conn.sendFile(m.chat, video, 'fb.mp4', '*✅ Video de Facebook*', m);
      } catch (e) { continue; }
    }
    return m.reply('❌ No se pudo descargar de Facebook');
  }

  // === Threads ===
  if (/threads\.net/i.test(url)) {
    await m.react('🕓')
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
        const tipo = file.includes('.jpg') || file.includes('.png') ? 'image' : 'video';
        const name = tipo === 'image' ? 'thread.jpg' : 'thread.mp4';
        await m.react('✅')
        return await conn.sendFile(m.chat, file, name, '*✅ Archivo de Threads*', m);
      } catch (e) { continue; }
    }
    return m.reply('❌ No se pudo descargar de Threads');
  }

  // === Mediafire ===
  if (/mediafire\.com/i.test(url)) {
    await m.react('🕓')
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
          await m.react('✅')
          return await conn.sendFile(m.chat, data.link || data.url, data.nama || data.filename, '', m, null, { mimetype: data.mime || data.mimetype, asDocument: true });
        }
      } catch (e) { continue; }
    }
    return m.reply('❌ No se pudo descargar de MediaFire');
  }

  // === YouTube (MP4) ===
  /*if (/youtu\.be|youtube\.com/i.test(url)) {
await m.react('🕓')
    const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/
    let videoIdToFind = text.match(youtubeRegexID) || null
//await m.react('🕓')
  
let videoId
let yt_play = await search(text)
let ytplay2 = await yts(videoIdToFind === null ? text : 'https://youtu.be/' + videoIdToFind[1])

if (videoIdToFind) {
videoId = videoIdToFind[1]
ytplay2 = ytplay2.all.find(v => v.videoId === videoId) || ytplay2.videos.find(v => v.videoId === videoId)
}
ytplay2 = ytplay2?.all?.[0] || ytplay2?.videos?.[0] || ytplay2

if (!ytplay2?.title) {
let title = null

try {
const res1 = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${text}`)
const data1 = await res1.json()
title = data1?.result?.metadata?.title
} catch (e) {
console.error('Error con API Vreden:', e)
}

if (!title) {
try {
const res2 = await fetch(`https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(text)}&type=audio&quality=128kbps&apikey=GataDios`)
const data2 = await res2.json()
title = data2?.title
} catch (e) {
console.error('Error con API Neoxr:', e)
}}

if (!title) {
try {
const res3 = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${text}`)
const data3 = await res3.json()
title = data3?.data?.title
} catch (e) {
console.error('Error con API Siputzx:', e)
}}

if (title) {
yt_play = await yts(title)
ytplay2 = yt_play?.all?.[0] || yt_play?.videos?.[0] || yt_play
if (videoIdToFind) {
videoId = videoIdToFind[1]
ytplay2 = yt_play.all.find(v => v.videoId === videoId) || yt_play.videos.find(v => v.videoId === videoId) || ytplay2
}}
}
      
const caption = `「✦」Descargando *<${ytplay2?.title || 'Desconocido'}>*\n> ✦ Descripción » *${ytplay2?.description || 'Desconocido'}*\n> ✰ Vistas » *${formatViews(ytplay2?.views) || 'Desconocido'}*\n> ⴵ Duración » *${ytplay2?.timestamp || 'Desconocido'}*\n> ✐ Publicación » *${ytplay2?.ago || 'Desconocido'}*\n> ✦ Url » *${ytplay2?.url.replace(/^https:\/\//, "")}*\n
*_Para seleccionar, escribe respondiendo a este mensaje:_*
> "a" o "audio" → *Audio*
> "v" o "video" → *Video*
> "adoc" → *Audio (doc)*
> "vdoc" → *Video (doc)*
`.trim()
    const thumb = (await conn.getFile(ytplay2.thumbnail))?.data
const JT = {
      contextInfo: {
        externalAdReply: {
          title: '✧ Youtube • Music ✧',
          body: dev,
          mediaType: 1,
          previewType: 0,
          mediaUrl: ytplay2.url,
          sourceUrl: ytplay2.url,
          thumbnail: thumb,
          renderLargerThumbnail: true,
        },
      },
    }

await conn.reply(m.chat, caption, m, JT)
    
    const apis = [
      `https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=360p&apikey=GataDios`,
      `https://api.agatz.xyz/api/ytmp4?url=${url}`,
      `https://api.siputzx.my.id/api/d/ytmp4?url=${url}`
    ];
    for (const api of apis) {
      try {
        const res = await fetch(api);
        const json = await res.json();
        const dl = json.data?.download || json.data?.dl || json.data?.downloadUrl;
        if (dl) return await conn.sendFile(m.chat, dl, 'video.mp4', '*✅ Video de YouTube*', m);
      } catch (e) { continue; }
    }
    return m.reply('❌ No se pudo descargar de YouTube');
  }*/
  const tempStorage = new Map(); // Mapa para almacenamiento temporal

if (/youtu\.be|youtube\.com/i.test(url)) {
  await m.react('🕓');

  const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/;
  let videoIdToFind = text.match(youtubeRegexID) || null;

  let videoId;
  let yt_play = await search(text);
  let ytplay2 = await yts(videoIdToFind ? 'https://youtu.be/' + videoIdToFind[1] : text);

  if (videoIdToFind) {
    videoId = videoIdToFind[1];
    ytplay2 = ytplay2.all.find(v => v.videoId === videoId) || ytplay2.videos.find(v => v.videoId === videoId);
  }
  ytplay2 = ytplay2?.all?.[0] || ytplay2?.videos?.[0] || ytplay2;

  if (!ytplay2?.title) {
    let title = null;
    try {
      let res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${text}`);
      let data = await res.json();
      title = data?.result?.metadata?.title;
    } catch {}
    if (!title) {
      try {
        let res = await fetch(`https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(text)}&type=audio&quality=128kbps&apikey=GataDios`);
        let data = await res.json();
        title = data?.title;
      } catch {}
    }
    if (!title) {
      try {
        let res = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${text}`);
        let data = await res.json();
        title = data?.data?.title;
      } catch {}
    }
    if (title) {
      yt_play = await yts(title);
      ytplay2 = yt_play?.all?.[0] || yt_play?.videos?.[0] || yt_play;
      if (videoIdToFind) {
        videoId = videoIdToFind[1];
        ytplay2 = yt_play.all.find(v => v.videoId === videoId) || yt_play.videos.find(v => v.videoId === videoId) || ytplay2;
      }
    }
  }

  const caption = `「✦」Descargando *<${ytplay2?.title || 'Desconocido'}>*\n> ✦ Descripción » *${ytplay2?.description || 'Desconocido'}*\n> ✰ Vistas » *${formatViews(ytplay2?.views) || 'Desconocido'}*\n> ⴵ Duración » *${ytplay2?.timestamp || 'Desconocido'}*\n> ✐ Publicación » *${ytplay2?.ago || 'Desconocido'}*\n> ✦ Url » *${ytplay2?.url.replace(/^https:\/\//, "")}*\n\n*_Para seleccionar, responde a este mensaje:_*\n> "a" o "audio" → *Audio*\n> "v" o "video" → *Video*\n> "adoc" → *Audio (doc)*\n> "vdoc" → *Video (doc)*`.trim();

  const thumb = (await conn.getFile(ytplay2.thumbnail))?.data;
  const JT = {
    contextInfo: {
      externalAdReply: {
        title: '✧ Youtube • Music ✧',
        body: dev,
        mediaType: 1,
        previewType: 0,
        mediaUrl: ytplay2.url,
        sourceUrl: ytplay2.url,
        thumbnail: thumb,
        renderLargerThumbnail: true,
      },
    },
  };

  tempStorage.set(m.sender, {
    url: ytplay2.url,
    title: ytplay2.title,
    resp: m
  });

  // Eliminar después de 2 minutos
  setTimeout(() => tempStorage.delete(m.sender), 2 * 60 * 1000);

  await conn.reply(m.chat, caption, m, JT);
} else if (tempStorage.has(m.sender)) {
    if (!m.quoted || m.quoted.sender !== conn.user.jid) return;

  text = m.text.trim().toLowerCase();
  if (!['a', 'audio', 'v', 'video', 'adoc', 'vdoc'].includes(text)) return;

  const data = tempStorage.get(m.sender);
  if (!data || !data.url) return;

  const audioOpts = { "a": "audio", "audio": "audio", "adoc": "document" };
  const videoOpts = {
    "v": { type: "video", caption: true },
    "video": { type: "video", caption: true },
    "vdoc": { type: "document", caption: false }
  };

  if (text in audioOpts) {
    await conn.reply(m.chat, `*${audioOpts[text] === "document" ? "Enviando Documento de Audio..." : "Enviando Audio..."}*`, data.resp);

    const apis = [
      [`https://api.vreden.my.id/api/ytmp3?url=${data.url}`, res => res?.result?.download?.url, res => res?.result?.title],
      [`https://api.neoxr.eu/api/youtube?url=${data.url}&type=audio&quality=128kbps&apikey=GataDios`, res => res?.data?.url, res => res?.title],
      [`https://api.siputzx.my.id/api/d/ytmp3?url=${data.url}`, res => res?.data?.dl, res => res?.data?.title]
    ];

    for (const [api, getUrl, getTitle] of apis) {
      try {
        const res = await fetch(api).then(r => r.json());
        const dl = getUrl(res);
        if (dl) {
          await conn.sendMessage(m.chat, {
            [audioOpts[text]]: { url: dl },
            fileName: `${getTitle(res) || data.title}.mp3`,
            mimetype: 'audio/mpeg'
          }, { quoted: data.resp });
          tempStorage.delete(m.sender);
          return m.reply(`> ✅ *Audio enviado.*`);
        }
      } catch {}
    }
    return m.reply('❌ No se pudo obtener el audio.');

  } else if (text in videoOpts) {
    await conn.reply(m.chat, `*${videoOpts[text].caption ? "Enviando Vídeo..." : "Enviando Documento de Vídeo..."}*`, data.resp);

    const apis = [
      [`https://api.neoxr.eu/api/youtube?url=${data.url}&type=video&quality=360p&apikey=GataDios`, res => res?.data?.url, res => res?.title],
      [`https://api.siputzx.my.id/api/d/youtube?q=${data.title}`, res => res?.data?.video, res => res?.data?.title]
    ];

    for (const [api, getUrl, getTitle] of apis) {
      try {
        const res = await fetch(api).then(r => r.json());
        const dl = getUrl(res);
        if (dl) {
          await conn.sendMessage(m.chat, {
            [videoOpts[text].type]: { url: dl },
            fileName: `${getTitle(res) || data.title}.mp4`,
            mimetype: 'video/mp4'
          }, { quoted: data.resp });
          tempStorage.delete(m.sender);
          return m.reply(`> ✅ *Vídeo enviado.*`);
        }
      } catch {}
    }
    return m.reply('❌ No se pudo obtener el vídeo.');
  }
}



  // === Spotify ===
  if (/spotify\.com\/track/i.test(url)) {
   await m.react('🕓')
    const apis = [
      `https://api.neoxr.eu/api/spotify?url=${url}&apikey=russellxz`,
      `https://api.siputzx.my.id/api/d/spotify?url=${url}`,
      `https://api.agatz.xyz/api/spotify?url=${url}`
    ];
    for (const api of apis) {
      try {
        const res = await fetch(api);
        const json = await res.json();
        const audio = json.data?.download || json.data?.url;
        await m.react('✅')
        if (audio) return await conn.sendFile(m.chat, audio, 'spotify.mp3', '*🎵 Aquí tienes tu canción de Spotify*', m);
      } catch (e) { continue; }
    }
    return m.reply('❌ No se pudo descargar de Spotify');
  }
          //}

};

async function search(query, options = {}) {
const search = await yts.search({query, hl: 'es', gl: 'ES', ...options})
return search.videos
}

function MilesNumber(number) {
const exp = /(\d)(?=(\d{3})+(?!\d))/g;
const rep = '$1.';
const arr = number.toString().split('.');
arr[0] = arr[0].replace(exp, rep);
return arr[1] ? arr.join('.') : arr[0];
}

async function getFileSize(url) {
try {
const response = await fetch(url, { method: 'HEAD' })
const contentLength = response.headers.get('content-length')
if (!contentLength) return "Tamaño no disponible"
const sizeInBytes = parseInt(contentLength, 10);
return await formatSize(sizeInBytes)
} catch (error) {
console.error("Error al obtener el tamaño del archivo:", error)
return "Error al obtener el tamaño"
}}

async function formatSize(bytes) {
if (bytes >= 1e9) {
return (bytes / 1e9).toFixed(2) + " GB"
} else if (bytes >= 1e6) {
return (bytes / 1e6).toFixed(2) + " MB"
} else {
return bytes + " bytes"
}}

function formatViews(views) {
  if (views === undefined) {
    return "No disponible"
  }

  if (views >= 1_000_000_000) {
    return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`
  } else if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`
  } else if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`
  }
  return views.toString()
}
