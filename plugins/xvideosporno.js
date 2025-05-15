import fetch from 'node-fetch';
import cheerio from 'cheerio';
import Starlights from '@StarlightsTeam/Scraper';

const handler = async (m, { text, usedPrefix, command }) => {
  if (!db.data.chats[m.chat].nsfw && m.isGroup) {
    return conn.reply(m.chat, `${e} El contenido *NSFW* está desactivado en este grupo.\n> Un administrador puede activarlo con » *${usedPrefix}nsfw on*`, m);
  }

  if (!text) {
    return conn.reply(m.chat, `${e} Por favor, ingresa una búsqueda para encontrar un video de *Xvideos*.\n\n> Ejemplo de uso: *${usedPrefix + command} colegiala latina*`, m);
  }

  if (/^https?:\/\/[^ ]+$/.test(text)) {
    return conn.reply(m.chat, `${e} Solo se permite ingresar texto para realizar una búsqueda.\n\nSi deseas descargar directamente, usa el comando *${usedPrefix}xvideosdl* [URL]`, m);
  }

  try {
    await m.react('🕒');

    const vids_ = {
      from: m.sender,
      urls: [],
    };

    if (!global.videoListXXX) global.videoListXXX = [];
    if (global.videoListXXX[0]?.from === m.sender) {
      global.videoListXXX.splice(0, global.videoListXXX.length);
    }

    const res = await xvideosSearch(text);
    if (!res.length) {
      return conn.reply(m.chat, `❌ No se encontraron resultados para: *${text}*`, m);
    }

    const firstVideoLink = res[0].url;
    vids_.urls.push(firstVideoLink);

    const { title, dl_url } = await Starlights.xvideosdl(firstVideoLink);

    await m.react('✅');
    await conn.sendFile(m.chat, dl_url, title + '.mp4', `╭───── • ─────╮
  𖤐 \`XVIDEOS EXTRACTOR\` 𖤐
╰───── • ─────╯

✦ *Título:* ${title}`, m);
    global.videoListXXX.push(vids_);
  } catch (err) {
    return conn.reply(m.chat, `⚠️ Ocurrió un error: ${err.message}`, m);
  }
};

handler.command = ['xvideos', 'sexo2', 'pornoxv', 'porno2'];
handler.group = true;

export default handler;

async function xvideosSearch(query) {
  const url = `https://www.xvideos.com/?k=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  const results = [];

  $('div.mozaique > div').each((_, el) => {
    const title = $(el).find('p.title a').attr('title');
    const href = $(el).find('p.title a').attr('href');
    const duration = $(el).find('span.duration').text().trim();
    const quality = $(el).find('span.video-hd-mark').text().trim();

    if (title && href) {
      results.push({
        title,
        url: 'https://www.xvideos.com' + href,
        duration,
        quality
      });
    }
  });

  return results;
}
