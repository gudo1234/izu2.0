import fetch from 'node-fetch';
import axios from 'axios';
import cheerio from 'cheerio';
import Starlights from '@StarlightsTeam/Scraper';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!global.db.data.chats[m.chat].nsfw && m.isGroup)
    return conn.reply(m.chat, `🚩 El contenido *NSFW* está desactivado en este grupo.\n> Un administrador puede activarlo con el comando » *${usedPrefix}nsfw on*`, m);

  if (!text) {
    return conn.reply(m.chat, `🚩 Por favor, ingrese una búsqueda o enlace de Xvideos.\n\nEjemplo de búsqueda: *${usedPrefix + command} colegialas*\nEjemplo de descarga: *${usedPrefix + command} https://www.xvideos.com/video1234*`, m);
  }

  const user = global.db.data.users[m.sender];
  const isUrl = /^https?:\/\/(?:www\.)?xvideos\.com\/video\d+/i.test(text);

  try {
    await m.react('🕒');

    if (isUrl) {
      // Descargar directamente desde enlace
      const { title, dl_url } = await Starlights.xvideosdl(text);
      await conn.sendFile(m.chat, dl_url, title + '.mp4', `*» Título:* ${title}`, m, false, {
        asDocument: user.useDocument
      });
      await m.react('✅');
    } else {
      // Buscar en Xvideos
      const results = await xvideosSearch(text);
      if (!results.length) {
        return conn.reply(m.chat, `❌ No se encontraron resultados para: *${text}*`, m);
      }

      let response = `🔎 *Resultados de búsqueda para:* *${text}*\n\n`;
      results.slice(0, 5).forEach((vid, i) => {
        response += `*${i + 1}.* ${vid.title}\n🕒 ${vid.duration} | ${vid.quality || 'Sin calidad'}\n🔗 ${vid.url}\n\n`;
      });

      response += `\n_Responde con el número del video o vuelve a escribir el enlace para descargarlo._`;
      await conn.reply(m.chat, response.trim(), m);
      await m.react('✅');
    }
  } catch (err) {
    await m.react('❌');
    console.error(err);
    conn.reply(m.chat, `⚠️ Ocurrió un error:\n${err.message}`, m);
  }
};

handler.command = ['xvideos', 'xv', 'pornochido'];
handler.group = true;

export default handler;

async function xvideosSearch(query) {
  try {
    const url = `https://www.xvideos.com/?k=${encodeURIComponent(query)}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const results = [];

    $("div.mozaique > div").each((_, el) => {
      const title = $(el).find("p.title a").attr("title");
      const videoUrl = "https://www.xvideos.com" + $(el).find("p.title a").attr("href");
      const duration = $(el).find("span.duration").text().trim();
      const quality = $(el).find("span.video-hd-mark").text().trim();

      if (title && videoUrl) {
        results.push({ title, url: videoUrl, duration, quality });
      }
    });

    return results;
  } catch (err) {
    throw new Error("No se pudo realizar la búsqueda.");
  }
}
