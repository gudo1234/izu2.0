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

  const url = normalizeTikTokUrl(text) || text;
  const valid = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com\/@[\w.-]+\/video\/\d+|tiktok\.com\/t\/[\w.-]+|vm\.tiktok\.com\/[\w.-]+|vt\.tiktok\.com\/[\w.-]+)/i.test(url);
  if (!valid) {
    return conn.reply(m.chat, '✗ La URL proporcionada no es válida para TikTok', m);
  }

  await m.react('🕒');

  try {
    // Paso 1: Verificamos con la API para saber si es imagen o video
    const checkApi = await fetch(`https://api.dorratz.com/v2/tiktok-dl?url=${encodeURIComponent(url)}`);
    if (!checkApi.ok) throw new Error('API no disponible');

    const apiData = await checkApi.json();
    const media = apiData?.data?.media;

    // Si es tipo imagen usamos directamente la API
    if (media?.type === 'image') {
      const images = media.images || [];
      const audio = media.audio;
      const video = apiData.data;

      const txt = `*「✦」Título:* ${video.title || 'Sin título'}
> *✦ Autor:* » ${video.author?.nickname || 'Desconocido'}
> *ⴵ Duración:* » ${video.duration ? `${video.duration} segundos` : 'No especificado'}
> *🜸 Likes:* » ${video.like || 0}
> *✎ Comentarios:* » ${video.comment || 0}`;

      for (let i = 0; i < images.length; i++) {
        await conn.sendFile(m.chat, images[i], `foto_${i + 1}.jpg`, `*Imagen ${i + 1} del TikTok*`, m);
      }
      if (audio) await conn.sendFile(m.chat, audio, 'audio.mp3', '*Audio original*', m);

      return await m.react('✅');
    }

    // Paso 2: Si no es imagen, usamos el scraper para video normal
    const result = await Starlights.tiktokdl(url);

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

    await conn.sendFile(m.chat, result.dl_url, 'tiktok.mp4', txt, m);
    await m.react('✅');

  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, '❌ Ocurrió un error al procesar el TikTok. Intenta de nuevo más tarde.', m);
  }
};

handler.command = ['t', 'tiktokvid', 'tiktoksearch', 'tiktokdl', 'ttvid', 'tt', 'tiktok', 'ttimg', 'tiktokimg'];
handler.group = true;
export default handler;
