/*import Starlights from '@StarlightsTeam/Scraper';

function normalizeTikTokUrl(text) {
  const regex = /(https?:\/\/)?(www\.)?(vm\.|vt\.|www\.)?tiktok\.com\/[^\s]+/i;
  const match = text.match(regex);
  if (match) {
    let url = match[0];
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    return url;
  }
  return null;
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `${e} Usa el comando correctamente:\n\n📌 Ejemplo:\n*${usedPrefix + command}* La Vaca Lola\n*${usedPrefix + command}* https://vt.tiktok.com/ZShhtdsRh/`, m);
  }

  await m.react('🕒');

  try {
    let result, dl_url;
    let url = normalizeTikTokUrl(text);

    if (url) {
      result = await Starlights.tiktokdl(url);
    } else {
      result = await Starlights.tiktokvid(text); // búsqueda por palabras
    }

    dl_url = result.dl_url;

    let txt = `╭───── • ─────╮\n`;
    txt += `  𖤐 \`TIKTOK EXTRACTOR\` 𖤐\n`;
    txt += `╰───── • ─────╯\n\n`;

    txt += `✦ *Título* : ${result.title}\n`;
    txt += `✦ *Autor* : ${result.author}\n`;
    txt += `✦ *Duración* : ${result.duration} segundos\n`;
    txt += `✦ *Vistas* : ${result.views}\n`;
    txt += `✦ *Likes* : ${result.likes}\n`;
    txt += `✦ *Comentarios* : ${result.comment || result.comments_count}\n`;
    txt += `✦ *Compartidos* : ${result.share || result.share_count}\n`;
    txt += `✦ *Publicado* : ${result.published}\n`;
    txt += `✦ *Descargas* : ${result.downloads || result.download_count}\n\n`;

    txt += `╭───── • ─────╮\n`;
    txt += `> *${global.textbot || 'Bot'}*\n`;
    txt += `╰───── • ─────╯\n`;

    await m.react('✅');
    await conn.sendFile(m.chat, dl_url, 'tiktok.mp4', txt, m, null, rcanal);

  } catch (err) {
    console.error(err);
  }
};

handler.command = ['t', 'tiktokvid', 'tiktoksearch', 'tiktokdl', 'ttvid', 'tt', 'tiktok'];
handler.group = true;
export default handler;*/

import fetch from 'node-fetch';
import Starlights from '@StarlightsTeam/Scraper';

function normalizeTikTokUrl(text) {
  const regex = /(https?:\/\/)?(www\.)?(vm\.|vt\.|www\.)?tiktok\.com\/[^\s]+/i;
  const match = text.match(regex);
  if (match) {
    let url = match[0];
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    return url;
  }
  return null;
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `✎ Usa el comando correctamente:\n\n📌 Ejemplo:\n*${usedPrefix + command}* La Vaca Lola\n*${usedPrefix + command}* https://vt.tiktok.com/ZShhtdsRh/`, m);
  }

  await m.react('🕒');

  try {
    let result, dl_url;
    const isUrl = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com\/@[\w.-]+\/video\/\d+|tiktok\.com\/t\/[\w.-]+|vm\.tiktok\.com\/[\w.-]+|vt\.tiktok\.com\/[\w.-]+)/i.test(text);

    // PRIMER INTENTO: API
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
          isFromApi: true
        };
        dl_url = result.dl_url;
      }
    }

    // SEGUNDO INTENTO: SCRAPER
    if (!result) {
      const url = normalizeTikTokUrl(text);
      const scrape = url ? await Starlights.tiktokdl(url) : await Starlights.tiktokvid(text);

      result = {
        ...scrape,
        dl_url: scrape.dl_url,
        type: 'video',
        isFromApi: false
      };
      dl_url = result.dl_url;
    }

    // TEXTO FORMATEADO
    let txt = `╭───── • ─────╮
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
✦ *Descargas* : ${result.downloads || '-'}

╭───── • ─────╮
> *${textbot}*
╰───── • ─────╯`;

    await m.react('✅');

    // ENVÍO DE ARCHIVO SEGÚN TIPO
    if (result.type === 'image' && result.images?.length > 0) {
      for (let i = 0; i < result.images.length; i++) {
        await conn.sendFile(m.chat, result.images[i], `foto_${i + 1}.jpg`, `*Foto ${i + 1} del TikTok*`, m, null, rcanal);
      }
      if (result.audio) await conn.sendFile(m.chat, result.audio, 'audio.mp3', '*Audio original*', m, null, rcanal);
    } else {
      await conn.sendFile(m.chat, dl_url, 'tiktok.mp4', txt, m, null, rcanal);
    }

  } catch (err) {
    console.error('[ERROR TOTAL]', err);
    conn.reply(m.chat, '✗ No se pudo descargar el TikTok. Verifica el enlace o intenta con otra búsqueda.', m);
  }
};

handler.command = ['t', 'tiktokvid', 'tiktoksearch', 'tiktokdl', 'ttvid', 'tt', 'tiktok', 'ttimg', 'tiktokimg'];
handler.group = true;
export default handler;
