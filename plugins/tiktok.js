import fetch from 'node-fetch';
import Starlights from '@StarlightsTeam/Scraper';
import {
  generateWAMessageFromContent,
  generateWAMessage,
  delay
} from '@whiskeysockets/baileys';

/*───────────────────────────────────────────────
 🔹 Normalización de URL de TikTok
───────────────────────────────────────────────*/
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

/*───────────────────────────────────────────────
 🔹 Envío de Álbum (videos/imágenes)
───────────────────────────────────────────────*/
async function sendAlbumMessage(conn, jid, medias, options = {}) {
  if (typeof jid !== "string") throw new TypeError("jid must be string");
  if (!Array.isArray(medias) || medias.length < 2) throw new RangeError("Minimum 2 media required");

  const caption = options.caption || "";
  const wait = !isNaN(options.delay) ? options.delay : 800;

  const album = generateWAMessageFromContent(
    jid,
    {
      albumMessage: {
        expectedImageCount: medias.filter(m => m.type === "image").length,
        expectedVideoCount: medias.filter(m => m.type === "video").length,
        ...(options.quoted ? {
          contextInfo: {
            remoteJid: options.quoted.key.remoteJid,
            fromMe: options.quoted.key.fromMe,
            stanzaId: options.quoted.key.id,
            participant: options.quoted.key.participant || options.quoted.key.remoteJid,
            quotedMessage: options.quoted.message,
          },
        } : {})
      }
    },
    {}
  );

  await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id });

  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i];
    try {
      const msg = await generateWAMessage(
        album.key.remoteJid,
        { [type]: data, ...(i === 0 ? { caption } : {}) },
        { upload: conn.waUploadToServer }
      );
      msg.message.messageContextInfo = { messageAssociation: { associationType: 1, parentMessageKey: album.key } };
      await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
      await delay(wait);
    } catch (err) {
      console.warn(`[WARN ALBUM] No se pudo enviar el archivo ${i + 1}:`, err.message);
      continue;
    }
  }

  return album;
}

/*───────────────────────────────────────────────
 🔹 Comando principal
───────────────────────────────────────────────*/
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

      if (video?.media?.org || video?.media?.images?.length > 0) {
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
          type: video.media.type,
          images: video.media.images,
          audio: video.media.audio,
          videos: video.media.videos || [], // 👈 soporte álbum de videos
          isFromApi: true
        };
        dl_url = result.dl_url;
      }
    }

    // SEGUNDO INTENTO: SCRAPER STARLIGHTS
    if (!result) {
      const url = normalizeTikTokUrl(text);
      const scrape = url ? await Starlights.tiktokdl(url) : await Starlights.tiktokvid(text);
      result = { ...scrape, dl_url: scrape.dl_url, type: 'video', isFromApi: false };
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

    /*───────────────────────────────────────────────
     🔹 Envío de álbum si hay 5 videos
    ───────────────────────────────────────────────*/
    if (result.videos && Array.isArray(result.videos) && result.videos.length >= 2) {
      const limit = Math.min(result.videos.length, 5);
      const medias = result.videos.slice(0, limit).map(v => ({
        type: 'video',
        data: { url: v }
      }));

      await sendAlbumMessage(conn, m.chat, medias, {
        caption: `${e} *Se muestran resultados del TikTok*`,
        quoted: m
      });
    }

    /*───────────────────────────────────────────────
     🔹 Envío individual (por defecto)
    ───────────────────────────────────────────────*/
    else if (result.type === 'image' && result.images?.length > 0) {
      for (let i = 0; i < result.images.length; i++) {
        await conn.sendFile(m.chat, result.images[i], `foto_${i + 1}.jpg`, `*Foto ${i + 1} del TikTok*`, m);
      }
      if (result.audio) await conn.sendFile(m.chat, result.audio, 'audio.mp3', '*Audio original*', m, false, { mimetype: 'audio/mpeg' });
    } else {
      await conn.sendFile(m.chat, dl_url, 'tiktok.mp4', txt, m, null, rcanal);
    }

  } catch (err) {
    console.error('[ERROR TOTAL]', err);
    conn.reply(m.chat, '✗ No se pudo descargar el TikTok. Verifica el enlace o intenta con otra búsqueda.', m);
  }
};

handler.command = ['tiktokvid', 'tiktokdl', 'ttvid', 'tt', 'tiktok', 'ttimg', 'tiktokimg'];
handler.group = true;

export default handler;
