import fetch from 'node-fetch';
import cheerio from 'cheerio';
import Starlights from '@StarlightsTeam/Scraper';

const handler = async (m, { text, usedPrefix, command }) => {
  if (!db.data.chats[m.chat].nsfw && m.isGroup) {
    return conn.reply(m.chat, `${e} El contenido *NSFW* está desactivado en este grupo.\n> Un administrador puede activarlo con el comando » *#nsfw on*`, m);
  }

  if (!text) {
    return conn.reply(m.chat, `${e} Por favor, ingrese una búsqueda o URL para hacer una descarga de *porno* "xnxx".\n> Ejemplo: *${usedPrefix + command}* Con mi prima\n> O: *${usedPrefix + command}* https://www.xnxx.es/video-1331hhfa/rubia_de_tetas_grandes_es_golpeada_y_un_bocado_de_semen`, m);
  }

  try {
    let videoUrl = '';
    const isUrl = /^https?:\/\/(www\.)?xnxx\.com\/video/.test(text);

    if (isUrl) {
      videoUrl = text;
    } else {
      // Si no es URL, hacer búsqueda
      const res = await xnxxsearch(text);
      const json = res.result;

      if (!json.length) {
        return conn.reply(m.chat, `${e} No se encontraron resultados para "${text}"`, m);
      }

      videoUrl = json[0].link; // Primer resultado
    }

    const { title, dl_url } = await Starlights.xnxxdl(videoUrl);
    const user = global.db.data.users[m.sender];

    await conn.sendFile(m.chat, dl_url, `${title}.mp4`, `*Título* : ${title}`, m, false, {
      asDocument: user.useDocument
    });
  } catch (err) {
    return conn.reply(m.chat, `${e} Ocurrió un error: ${err.message}`, m);
  }
};

handler.command = ['xnxx', 'porno'];
handler.group = false;

export default handler;

async function xnxxsearch(query) {
  return new Promise((resolve, reject) => {
    const baseurl = 'https://www.xnxx.com';

    fetch(`${baseurl}/search/${encodeURIComponent(query)}/${Math.floor(Math.random() * 3) + 1}`)
      .then(res => res.text())
      .then(res => {
        const $ = cheerio.load(res);
        const results = [];

        $('div.mozaique > div').each((i, el) => {
          const a = $(el).find('a');
          const title = a.attr('title');
          const href = a.attr('href');
          const info = $(el).find('p.metadata').text();

          if (href && title) {
            results.push({
              title,
              info,
              link: 'https://www.xnxx.com' + href.replace('/THUMBNUM/', '/')
            });
          }
        });

        resolve({ code: 200, status: true, result: results });
      })
      .catch(err => reject({ code: 503, status: false, result: err }));
  });
}
