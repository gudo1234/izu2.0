import fetch from 'node-fetch';
import Starlights from '@StarlightsTeam/Scraper';

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function sendAlbumVideos(conn, jid, videoUrls = [], options = {}) {
  if (!Array.isArray(videoUrls) || videoUrls.length === 0) throw new Error('No hay videos en el álbum');
  const caption = options.caption || '';
  const delay = options.delay || 800;
  const quoted = options.quoted;

  // Enviar primer video
  const first = await conn.sendMessage(jid, { video: { url: videoUrls[0] }, caption }, { quoted });
  for (let i = 1; i < videoUrls.length; i++) {
    await sleep(delay);
    await conn.sendMessage(jid, { video: { url: videoUrls[i] } }, { quoted: first });
  }
}

function normalizeTikTokUrl(text) {
  const regex = /(https?:\/\/)?(www\.)?(vm\.|vt\.|www\.)?tiktok\.com\/[^\s]+/i;
  const match = text.match(regex);
  if (match) {
    let url = match[0];
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    return url;
  }
  return null;
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return conn.reply(m.chat, `✎ Usa el comando correctamente:\n\n📌 Ejemplo:\n*${usedPrefix + command}* La Vaca Lola\n*${usedPrefix + command}* https://vt.tiktok.com/ZShhtdsRh/`, m);

  await m.react('🕒');

  try {
    let result = null;
    const isUrl = /tiktok\.com\//i.test(text);

    // INTENTO 1 - API Dorratz
    if (isUrl) {
      const apiUrl = `https://api.dorratz.com/v2/tiktok-dl?url=${encodeURIComponent(text)}`;
      const res = await fetch(apiUrl);
      const json = res.ok && await res.json();
      const video = json?.data;
      if (video?.media) {
        const media = video.media;
        result = {
          title: video.title || 'Sin título',
          author: video.author?.nickname || 'Desconocido',
          duration: video.duration || 'No especificado',
          views: video.play || 0,
          likes: video.like || 0,
          comment: video.comment || 0,
          share: video.share || 0,
          published: video.created || '-',
          downloads: video.download || 0,
          images: media.images || [],
          videos: media.videos || [media.org, media.no_watermark_hd, media.no_watermark].filter(Boolean),
          audio: media.audio || null,
          type: media.images ? 'image' : 'video'
        };
      }
    }

    // INTENTO 2 - SCRAPER STARLIGHTS
    if (!result) {
      const url = normalizeTikTokUrl(text);
      const scrape = url ? await Starlights.tiktokdl(url) : await Starlights.tiktokvid(text);
      result = {
        title: scrape.title,
        author: scrape.author,
        duration: scrape.duration,
        dl_url: scrape.dl_url,
        videos: [scrape.dl_url],
        type: 'video'
      };
    }

    // TEXTO
    const txt = `╭───── • ─────╮
𖤐 \`TIKTOK EXTRACTOR\` 𖤐
╰───── • ─────╯

✦ *Título:* ${result.title}
✦ *Autor:* ${result.author}
✦ *Duración:* ${result.duration}
✦ *Vistas:* ${result.views || '-'}
✦ *Likes:* ${result.likes || '-'}
✦ *Comentarios:* ${result.comment || '-'}
✦ *Compartidos:* ${result.share || '-'}
✦ *Publicado:* ${result.published || '-'}`;

    await m.react('✅');

    // MODO ÁLBUM (si hay varios videos)
    if (result.videos && result.videos.length > 1) {
      const videosToSend = result.videos.slice(0, 5);
      await sendAlbumVideos(conn, m.chat, videosToSend, { caption: `${txt}\n\n🎞️ *Álbum con ${videosToSend.length} videos*`, quoted: m });
      return;
    }

    // MODO IMAGEN
    if (result.type === 'image' && result.images?.length > 0) {
      for (let i = 0; i < result.images.length; i++) {
        await conn.sendFile(m.chat, result.images[i], `foto_${i + 1}.jpg`, `📸 *Foto ${i + 1} del TikTok*`, m);
      }
      if (result.audio) await conn.sendFile(m.chat, result.audio, 'audio.mp3', '*Audio original*', m, false, { mimetype: 'audio/mpeg' });
      return;
    }

    // VIDEO SIMPLE
    const url = result.videos?.[0] || result.dl_url;
    if (url) {
      await conn.sendFile(m.chat, url, 'tiktok.mp4', txt, m);
    } else {
      await conn.reply(m.chat, '❌ No se encontró ningún video para descargar.', m);
    }
  } catch (err) {
    console.error(err);
    await conn.reply(m.chat, '❌ No se pudo procesar el TikTok.', m);
  }
};

handler.command = ['tiktokvid', 'tiktokdl', 'ttvid', 'tt', 'tiktok', 'ttimg', 'tiktokimg'];
handler.group = true;
export default handler;
