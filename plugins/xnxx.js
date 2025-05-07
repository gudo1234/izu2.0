import fetch from 'node-fetch';
import cheerio from 'cheerio';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!db.data.chats[m.chat].nsfw && m.isGroup)
    return conn.reply(m.chat, 'El contenido NSFW está desactivado en este grupo.', m);

  if (!text) {
    return conn.reply(m.chat, `Por favor ingrese una búsqueda o un enlace.\nEjemplo: ${usedPrefix + command} prima`, m);
  }

  try {
    let url = '';
    if (text.includes('xnxx.com')) {
      url = text;
    } else {
      const search = await xnxxsearch(text);
      if (!search.result.length) throw new Error('No se encontraron resultados.');
      url = search.result[0].link;
    }

    const data = await xnxxdl(url);
    if (!data.result.files.high) throw new Error('No se encontró la URL de alta calidad.');

    return conn.sendMessage(m.chat, {
      document: { url: data.result.files.high },
      mimetype: 'video/mp4',
      fileName: data.result.title + '.mp4'
    }, { quoted: m });

  } catch (e) {
    const line = e.stack?.split('\n')[1]?.trim() || 'línea desconocida';
    return conn.reply(m.chat, 
      `Ocurrió un error en el proceso:\n\n*Error:* ${e.message}\n*Línea:* ${line}\n\nPosibles causas:\n- El video no tiene enlace directo.\n- El HTML de la página cambió.\n- El término de búsqueda no devolvió resultados.`, 
      m);
  }
};

handler.command = ['xnxx'];
handler.group = false;
export default handler;

async function xnxxsearch(query) {
  const baseurl = 'https://www.xnxx.com';
  const page = Math.floor(Math.random() * 3) + 1;
  const res = await fetch(`${baseurl}/search/${encodeURIComponent(query)}/${page}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const results = [];

  const anchors = $('a').get().filter(a => $(a).attr('href')?.startsWith('/video-'));
  const unique = new Set();

  for (const a of anchors) {
    const href = $(a).attr('href');
    const title = $(a).attr('title') || 'Sin título';
    if (href && !unique.has(href)) {
      unique.add(href);
      results.push({ title, info: 'Desconocido', link: baseurl + href });
    }
  }

  if (!results.length) throw new Error('No se encontraron resultados.');
  return { code: 200, status: true, result: results };
}

async function xnxxdl(URL) {
  const res = await fetch(URL);
  const html = await res.text();
  const $ = cheerio.load(html);
  const title = $('meta[property="og:title"]').attr('content');
  const videoScript = $('#video-player-bg script').html();
  const getUrl = (regex) => {
    const match = videoScript?.match(regex);
    return match ? match[1] : null;
  };

  const files = {
    low: getUrl(/html5player\.setVideoUrlLow'(.*?)';/),
    high: getUrl(/html5player\.setVideoUrlHigh'(.*?)';/),
    HLS: getUrl(/html5player\.setVideoHLS'(.*?)';/)
  };

  return {
    status: 200,
    result: { title, URL, files }
  };
    }
