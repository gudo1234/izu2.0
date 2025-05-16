import fetch from 'node-fetch';
import cheerio from 'cheerio';
import Starlights from '@StarlightsTeam/Scraper';

const handler = async (m, { text, usedPrefix, command, conn }) => {
  /*if (!db.data.chats[m.chat].nsfw && m.isGroup) {
    return conn.reply(m.chat, `❌ El contenido *NSFW* está desactivado en este grupo.\nActívalo con: *${usedPrefix}nsfw on*`, m);*/
  }

  if (!text) {
    return conn.reply(m.chat, `❌ Ingresa una búsqueda para encontrar un video de *Xvideos*.\n\nEjemplo:\n*${usedPrefix + command} colegiala latina*`, m);
  }

  if (/^https?:\/\/[^ ]+$/.test(text)) {
    return conn.reply(m.chat, `Solo se permite texto para buscar.\n\nPara descargar por URL, usa:\n*${usedPrefix}xvideosdl* [URL]`, m);
  }

  try {
    await m.react('🕒');

    const resultados = await xvideosSearch(text);
    if (!resultados.length) {
      return conn.reply(m.chat, `No se encontraron resultados para: *${text}*`, m);
    }

    const usados = new Set();
    const mensajes = [];

    for (let i = 0; i < 3; i++) {
      let video;
      do {
        video = resultados[Math.floor(Math.random() * resultados.length)];
      } while (usados.has(video.url));
      usados.add(video.url);

      const { title, url, duration } = video;
      const { dl_url } = await Starlights.xvideosdl(url);

      mensajes.push([
        `🔞 *${title}*\n⏱️ *Duración:* ${duration || 'Desconocida'}`,
        url,
        dl_url, // aquí se muestra el video directamente
        [],
        [],
        [
          [],
          ['▶ Ver Online', url]
        ],
        []
      ]);
    }

    await m.react('✅');
    await conn.sendCarousel(m.chat, null, null, null, mensajes);

  } catch (err) {
    console.error(err);
    return conn.reply(m.chat, `⚠️ Ocurrió un error: ${err.message}`, m);
  }
};

handler.command = ['xv'];
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

    if (title && href) {
      results.push({
        title,
        url: 'https://www.xvideos.com' + href,
        duration
      });
    }
  });

  return results;
}
