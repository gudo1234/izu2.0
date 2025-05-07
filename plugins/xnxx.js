import fetch from 'node-fetch';
import cheerio from 'cheerio';
import Starlights from '@StarlightsTeam/Scraper';

const handler = async (m, { text, usedPrefix, command }) => {
  if (!db.data.chats[m.chat].nsfw && m.isGroup) {
    return conn.reply(m.chat, `${e} El contenido *NSFW* está desactivado en este grupo.\n> Un administrador puede activarlo con el comando » *#nsfw on*`, m);
  }

  if (!text) {
    return conn.reply(m.chat, `${e} Por favor, ingrese la búsqueda de un video *porno* de xnxx.\n\n> Ejemplo de uso: ${usedPrefix + command} Con mi prima`, m);
  }

  try {
    const vids_ = {
      from: m.sender,
      urls: [],
    };

    if (!global.videoListXXX) {
      global.videoListXXX = [];
    }

    if (global.videoListXXX[0]?.from === m.sender) {
      global.videoListXXX.splice(0, global.videoListXXX.length);
    }

    // Realiza la búsqueda con el scraper
    const res = await xnxxsearch(text);
    const json = res.result;
    let cap = `*${e} Resultados de la búsqueda:* ${text.toUpperCase()}\n\n`;
    let count = 1;

    // Si no hay resultados, responde con un mensaje de error
    if (!json.length) {
      return conn.reply(m.chat, `${e} No se encontraron resultados para "${text}"`, m);
    }

    // Agrega el primer video encontrado a la lista
    const firstVideoLink = json[0].link;
    vids_.urls.push(firstVideoLink);

    // Usa el scraper para descargar el primer video
    const { title, dl_url } = await Starlights.xnxxdl(firstVideoLink);

    // Envía el video al grupo
    await conn.sendFile(m.chat, dl_url, title + '.mp4', `\`Título:\` ${title}`, m);
    
    global.videoListXXX.push(vids_);
  } catch (e) {
    return conn.reply(m.chat, `${e} Ocurrió un error: ${e.message}`, m);
  }
};

handler.command = ['xnxx', 'porno', 'sexo'];
handler.group = true;

export default handler;

async function xnxxsearch(query) {
  return new Promise((resolve, reject) => {
    const baseurl = 'https://www.xnxx.com';

    fetch(`${baseurl}/search/${query}/${Math.floor(Math.random() * 3) + 1}`, { method: 'get' })
      .then((res) => res.text())
      .then((res) => {
        const $ = cheerio.load(res, { xmlMode: false });
        const title = [];
        const url = [];
        const desc = [];
        const results = [];

        $('div.mozaique').each(function (a, b) {
          $(b).find('div.thumb').each(function (c, d) {
            url.push(baseurl + $(d).find('a').attr('href').replace('/THUMBNUM/', '/'));
          });
        });

        $('div.mozaique').each(function (a, b) {
          $(b).find('div.thumb-under').each(function (c, d) {
            desc.push($(d).find('p.metadata').text());
            $(d).find('a').each(function (e, f) {
              title.push($(f).attr('title'));
            });
          });
        });

        for (let i = 0; i < title.length; i++) {
          results.push({ title: title[i], info: desc[i], link: url[i] });
        }

        resolve({ code: 200, status: true, result: results });
      })
      .catch((err) => reject({ code: 503, status: false, result: err }));
  });
}
