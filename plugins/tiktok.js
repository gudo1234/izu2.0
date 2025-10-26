import fetch from 'node-fetch';
import Starlights from '@StarlightsTeam/Scraper';

/* pequeño helper sleep */
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

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

/* Envío de álbum robusto: envía primero el mensaje principal y asocia los demás al primero */
async function sendAlbumVideos(conn, jid, videoUrls = [], options = {}) {
  if (typeof jid !== 'string') throw new TypeError('jid must be string');
  if (!Array.isArray(videoUrls) || videoUrls.length < 2) throw new RangeError('Minimum 2 videos required for album');

  const caption = options.caption || '';
  const delay = !isNaN(options.delay) ? Number(options.delay) : 800;
  const quoted = options.quoted || null;

  // Enviamos el primer video con caption
  let firstMsg = null;
  try {
    firstMsg = await conn.sendMessage(jid, {
      video: { url: videoUrls[0] },
      caption
    }, { quoted });
  } catch (err) {
    // si falla el primer envío, lanzamos para que el caller lo controle
    throw new Error('No se pudo enviar el primer video del álbum: ' + (err?.message || err));
  }

  // enviamos el resto y los vinculamos al primer mensaje
  for (let i = 1; i < videoUrls.length; i++) {
    try {
      // Construimos contextInfo para intentar asociarlo como album (messageAssociation)
      const contextInfo = {};
      // si firstMsg.key existe, usamos messageAssociation (Baileys/WA soporta esto en algunas versiones)
      if (firstMsg && firstMsg.key) {
        contextInfo.messageAssociation = {
          associationType: 1,
          parentMessageKey: firstMsg.key
        };
      } else if (quoted) {
        // fallback: preservamos quoted para mantener referencia
        contextInfo.quotedMessage = quoted.message;
      }

      await conn.sendMessage(jid, {
        video: { url: videoUrls[i] }
      }, { quoted, contextInfo });

      await sleep(delay);
    } catch (err) {
      console.warn(`[WARN ALBUM] No se pudo enviar el video ${i + 1}:`, err?.message || err);
      // no abortamos el loop; continuamos con los demás
    }
  }

  return firstMsg;
}

/* Comando principal */
const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `✎ Usa el comando correctamente:\n\n📌 Ejemplo:\n*${usedPrefix + command}* La Vaca Lola\n*${usedPrefix + command}* https://vt.tiktok.com/ZShhtdsRh/`, m);
  }

  await m.react('🕒');

  try {
    let result, dl_url;
    const isUrl = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com\/@[\w.-]+\/video\/\d+|tiktok\.com\/t\/[\w.-]+|vm\.tiktok\.com\/[\w.-]+|vt\.tiktok\.com\/[\w.-]+)/i.test(text);

    // PRIMER INTENTO: API DORRATZ
    if (isUrl) {
      const apiUrl = `https://api.dorratz.com/v2/tiktok-dl?url=${encodeURIComponent(text)}`;
      const res = await fetch(apiUrl);
      const json = res.ok && await res.json();
      const video = json?.data;

      if (video?.media?.org || video?.media?.images?.length > 0 || Array.isArray(video?.media?.videos)) {
        result = {
          title: video.title || 'Sin título',
          author: video.author?.nickname || 'Desconocido',
          duration: video.duration || 'No especificado',
          views: video.play || 0,
          likes: video.like || 0,
          comment: video.comment || 0,
          share: video.share || 0,
          published: video.created || 'Desconocido',
          downloads: video.download || 0,
          dl_url: video.media.org || video.media.images?.[0] || null,
          type: video.media.type || (Array.isArray(video.media.videos) ? 'video' : 'image'),
          images: video.media.images || [],
          audio: video.media.audio || null,
          videos: video.media.videos || [], // soporte álbum de videos
          isFromApi: true
        };
        dl_url = result.dl_url;
      }
    }

    // SEGUNDO INTENTO: SCRAPER STARLIGHTS
    if (!result) {
      const url = normalizeTikTokUrl(text);
      const scrape = url ? await Starlights.tiktokdl(url) : await Starlights.tiktokvid(text);
      result = { ...scrape, dl_url: scrape.dl_url, type: (scrape.type || 'video'), isFromApi: false };
      dl_url = result.dl_url;
    }

    // TEXTO INFORMATIVO
    const txt = `╭───── • ─────╮
𖤐 \`TIKTOK EXTRACTOR\` 𖤐
╰───── • ─────╯

✦ *Título* : ${result.title}
✦ *Autor* : ${result.author}
✦ *Duración* : ${result.duration} segundos
✦ *Vistas* : ${result.views || '-'}
✦ *Likes* : ${result.likes || '-'}
✦ *Comentarios* : ${result.comment || '-'}
✦ *Compartidos* : ${result.share || '-'}
✦ *Publicado* : ${result.published || '-'}
✦ *Descargas* : ${result.downloads || '-'}`;

    await m.react('✅');

    // Si hay videos (array) y al menos 2 -> álbum (hasta 5)
    if (result.videos && Array.isArray(result.videos) && result.videos.length >= 2) {
      const limit = Math.min(result.videos.length, 5);
      const videosToSend = result.videos.slice(0, limit);

      try {
        await sendAlbumVideos(conn, m.chat, videosToSend, {
          caption: `${txt}\n\n🎞️ *Álbum con ${limit} videos de TikTok*`,
          quoted: m,
          delay: 900
        });
        return; // ya enviamos álbum, terminamos
      } catch (err) {
        console.warn('[WARN ALBUM FALLÓ]', err?.message || err);
        // si falla el álbum, caemos al envío individual
      }
    }

    // Envío de imágenes
    if (result.type === 'image' && result.images?.length > 0) {
      for (let i = 0; i < result.images.length; i++) {
        await conn.sendFile(m.chat, result.images[i], `foto_${i + 1}.jpg`, `*Foto ${i + 1} del TikTok*`, m);
      }
      if (result.audio) await conn.sendFile(m.chat, result.audio, 'audio.mp3', '*Audio original*', m, false, { mimetype: 'audio/mpeg' });
      return;
    }

    // Envío por defecto (un solo video)
    if (dl_url) {
      await conn.sendFile(m.chat, dl_url, 'tiktok.mp4', txt, m);
      return;
    }

    // Si no hay nada que enviar
    conn.reply(m.chat, '✗ No se encontró contenido para descargar.', m);

  } catch (err) {
    console.error('[ERROR TOTAL]', err);
    conn.reply(m.chat, '✗ No se pudo descargar el TikTok. Verifica el enlace o intenta con otra búsqueda.', m);
  }
};

handler.command = ['tiktokvid', 'tiktokdl', 'ttvid', 'tt', 'tiktok', 'ttimg', 'tiktokimg'];
handler.group = true;
export default handler;
