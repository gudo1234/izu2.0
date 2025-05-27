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
    return conn.reply(m.chat, `✦ Usa el comando correctamente:\n\n📌 Ejemplo:\n*${usedPrefix + command}* https://vm.tiktok.com/ZShhtdsRh/`, m);
  }

  const isValidUrl = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com\/@[\w.-]+\/video\/\d+|tiktok\.com\/t\/[\w.-]+|vm\.tiktok\.com\/[\w.-]+|vt\.tiktok\.com\/[\w.-]+)/i.test(text);
  if (!isValidUrl) {
    return conn.reply(m.chat, '✗ La URL proporcionada no es válida para TikTok', m);
  }

  await m.react('🕒');

  const url = normalizeTikTokUrl(text) || text;

  try {
    const result = await Starlights.tiktokdl(url);

    // Verifica si hay imágenes (fallback necesario)
    if (result.media_type === 'image' || result.type === 'image' || result.images) throw new Error('Contenido de imagen detectado');

    const txt = `╭───── • ─────╮
  𖤐 \`TIKTOK EXTRACTOR\` 𖤐
╰───── • ─────╯

✦ *Título:* ${result.title}
✦ *Autor:* ${result.author}
✦ *Duración:* ${result.duration} segundos
✦ *Vistas:* ${result.views}
✦ *Likes:* ${result.likes}
✦ *Comentarios:* ${result.comment || result.comments_count}
✦ *Compartidos:* ${result.share || result.share_count}
✦ *Publicado:* ${result.published}
✦ *Descargas:* ${result.downloads || result.download_count}

╭───── • ─────╮
> *${global.textbot || 'Bot'}*
╰───── • ─────╯`;

    await m.react('✅');
    await conn.sendFile(m.chat, result.dl_url, 'tiktok.mp4', txt, m, null, rcanal);

  } catch (e) {
    // Fallback con API en caso de error o imágenes
    try {
      const apiUrl = `https://api.dorratz.com/v2/tiktok-dl?url=${encodeURIComponent(url)}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('API no disponible');

      const json = await res.json();
      const video = json.data;
      const media = video.media;

      const txt = `*「✦」Título:* ${video.title || 'Sin título'}
> *✦ Autor:* » ${video.author?.nickname || 'Desconocido'}
> *ⴵ Duración:* » ${video.duration ? `${video.duration} segundos` : 'No especificado'}
> *🜸 Likes:* » ${video.like || 0}
> *✎ Comentarios:* » ${video.comment || 0}`;

      await m.react('✅');

      if (media.type === 'image') {
        const images = media.images || [];
        const audio = media.audio;

        for (let i = 0; i < images.length; i++) {
          await conn.sendFile(m.chat, images[i], `foto_${i + 1}.jpg`, `*Imagen ${i + 1} del TikTok*`, m);
        }
        if (audio) await conn.sendFile(m.chat, audio, 'audio.mp3', '*Audio original*', m);
      } else if (media.org) {
        await conn.sendFile(m.chat, media.org, 'tiktok.mp4', txt, m);
      } else {
        conn.reply(m.chat, 'No se encontró un medio válido para enviar.', m);
      }
    } catch (err2) {
      console.error(err2);
      return conn.reply(m.chat, '❌ Ocurrió un error al procesar el TikTok. Intenta de nuevo más tarde.', m);
    }
  }
};

handler.command = ['t', 'tiktokvid', 'tiktoksearch', 'tiktokdl', 'ttvid', 'tt', 'tiktok', 'ttimg', 'tiktokimg'];
handler.group = true;
export default handler;
