import fetch from 'node-fetch';
import cheerio from 'cheerio';

const handler = async (m, {conn, args, text, command, usedPrefix}) => {
  if (!db.data.chats[m.chat].nsfw && m.isGroup)
    return conn.reply(m.chat, 'El contenido NSFW está desactivado en este grupo. Un admin puede activarlo con: #nsfw on', m);

  if (!text) {
    return conn.reply(m.chat, `Uso incorrecto.\nEjemplo: ${usedPrefix + command} colegiala`, m);
  }

  try {
    await conn.reply(m.chat, 'Buscando video, por favor espera...', m);

    let url = '';
    if (text.includes('xnxx.com')) {
      url = text;
    } else {
      const search = await xnxxsearch(text);
      if (!search.result.length) throw new Error('No se encontraron resultados.');

      url = search.result[0].link;
    }

    const video = await xnxxdl(url);
    const fileUrl = video.result.files.high || video.result.files.low;

    if (!fileUrl) throw new Error('No se encontró ninguna URL de video (ni high ni low).');

    await conn.sendMessage(m.chat, {
      document: {url: fileUrl},
      mimetype: 'video/mp4',
      fileName: video.result.title || 'video_xnxx'
    }, {quoted: m});

  } catch (err) {
    const stack = err.stack || '';
    const line = (stack.match(/(xnxx\.js:\d+:\d+)/) || [])[1] || 'línea desconocida';
    return conn.reply(m.chat, `Ocurrió un error en el proceso:\n\n*Error:* ${err.message}\n*Línea:* ${line}\n\nPosibles causas:\n- El video no tiene enlace directo.\n- El HTML de la página cambió.\n- El término de búsqueda no devolvió resultados.`, m);
  }
};

handler.command = ['xnxx'];
handler.group = false;
export default handler;

// Función para buscar videos
async function xnxxsearch(query) {
  const baseurl = 'https://www.xnxx.com';
  const page = Math.floor(Math.random() * 3) + 1;
  const res = await fetch(`${baseurl}/search/${query}/${page}`);
  const html = await res.text();

  const $ = cheerio.load(html);
  const results = [];

  $('div.mozaique > div').each((i, el) => {
    const a = $(el).find('a');
    const title = a.attr('title');
    const link = baseurl + a.attr('href');
    const info = $(el).find('p.metadata').text();
    if (title && link) results.push({title, info, link});
  });

  return {code: 200, status: true, result: results};
}

// Función para obtener la URL de descarga
async function xnxxdl(url) {
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const title = $('meta[property="og:title"]').attr('content') || 'video_xnxx';
  const scriptContent = $('script').map((i, el) => $(el).html()).get().find(s => s.includes('html5player.setVideoUrl'));

  if (!scriptContent) throw new Error('No se encontró el script del reproductor.');

  const high = (scriptContent.match(/html5player\.setVideoUrlHigh['"](.+?)['"]/) || [])[1];
  const low = (scriptContent.match(/html5player\.setVideoUrlLow['"](.+?)['"]/) || [])[1];

  return {
    status: 200,
    result: {
      title,
      files: {high, low}
    }
  };
}
