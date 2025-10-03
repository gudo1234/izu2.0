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

  // Detectar si el texto es una URL
  if (/^https?:\/\/[^ ]+$/.test(text)) {
    return conn.reply(m.chat, `${e} Solo se permite ingresar texto para realizar una búsqueda.\n\nSi deseas descargar directamente, utiliza el comando *${usedPrefix}xnxxdl* https://www.xnxx.es/video-1331hhfa/rubia_de_tetas_grandes_es_golpeada_y_un_bocado_de_semen`, m);
  }

  try {
    await m.react('🕒'); // Reacción de espera

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

    if (!json.length) {
      return conn.reply(m.chat, `${e} No se encontraron resultados para "${text}"`, m);
    }

    const firstVideoLink = json[0].link;
    vids_.urls.push(firstVideoLink);

    // Descarga el video
    const { title, dl_url } = await Starlights.xnxxdl(firstVideoLink);

    await m.react('✅');
    await conn.sendFile(m.chat, dl_url, title + '.mp4', `╭───── • ─────╮
  𖤐 \`XNXX EXTRACTOR\` 𖤐
╰───── • ─────╯
✦ *Título:* ${title}`, m, null, rcanal);
    global.videoListXXX.push(vids_);
  } catch (err) {
    return conn.reply(m.chat, `${e} Ocurrió un error: ${err.message}`, m);
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
        const $ = cheerio.load(res);
        const results = [];

        $('div.mozaique').each((_, b) => {
          const thumbs = $(b).find('div.thumb');
          const infos = $(b).find('div.thumb-under');

          thumbs.each((i, el) => {
            const link = $(el).find('a').attr('href');
            const title = $(infos[i]).find('a').attr('title');
            const info = $(infos[i]).find('p.metadata').text();

            if (link && title) {
              results.push({
                title,
                info,
                link: baseurl + link.replace('/THUMBNUM/', '/'),
              });
            }
          });
        });

        resolve({ code: 200, status: true, result: results });
      })
      .catch((err) => reject({ code: 503, status: false, result: err }));
  });
}
