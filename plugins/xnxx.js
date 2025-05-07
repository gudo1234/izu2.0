import fetch from 'node-fetch';
import cheerio from 'cheerio';

const handler = async (m, { text, conn, usedPrefix, command }) => {
  try {
    if (!db.data.chats[m.chat].nsfw && m.isGroup) {
      return conn.reply(m.chat, `El contenido *NSFW* está desactivado en este grupo.\nUn admin puede activarlo con: *${usedPrefix}nsfw on*`, m);
    }

    if (!text) {
      return conn.reply(m.chat, `Uso incorrecto.\nEjemplo: *${usedPrefix + command} colegiala*`, m);
    }

    let url;
    if (/^https?:\/\/(www\.)?xnxx\.com\/video/.test(text)) {
      // Si es un enlace directo
      url = text;
    } else {
      // Si es una búsqueda
      const searchRes = await xnxxsearch(text);
      if (!searchRes.result.length) {
        throw new Error('No se encontraron resultados.');
      }
      url = searchRes.result[0].link;
    }

    await conn.reply(m.chat, 'Procesando video, espera un momento...', m);

    const res = await xnxxdl(url);
    const videoUrl = res.result.files.low || res.result.files.HLS;

    if (!videoUrl) throw new Error('No se encontró ninguna URL de video.');

    await conn.sendMessage(m.chat, {
      document: { url: videoUrl },
      mimetype: 'video/mp4',
      fileName: res.result.title + '.mp4'
    }, { quoted: m });

  } catch (e) {
    const line = (e.stack || '').split('\n')[1]?.trim() || 'línea desconocida';
    return conn.reply(m.chat, `Ocurrió un error en el proceso:\n\n*Error:* ${e.message}\n*Línea:* ${line}\n\nPosibles causas:\n- El video no tiene enlace directo.\n- El HTML de la página cambió.\n- El término de búsqueda no devolvió resultados.`, m);
  }
};

handler.command = ['xnxx'];
handler.group = true;

export default handler;

// FUNCIONES AUXILIARES

async function xnxxsearch(query) {
  const baseurl = 'https://www.xnxx.com';
  const page = Math.floor(Math.random() * 3) + 1;
  const res = await fetch(`${baseurl}/search/${query}/${page}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const results = [];

  $('div.mozaique div.thumb').each((_, el) => {
    const a = $(el).find('a').attr('href');
    if (a) {
      results.push({
        title: $(el).find('img').attr('alt') || 'Sin título',
        link: baseurl + a.replace('/THUMBNUM/', '/'),
        info: $(el).find('var').text() || 'Sin info'
      });
    }
  });

  if (!results.length) throw new Error('No se encontraron resultados.');
  return { code: 200, status: true, result: results };
}

async function xnxxdl(URL) {
  const res = await fetch(URL);
  const html = await res.text();
  const $ = cheerio.load(html);
  const title = $('meta[property="og:title"]').attr('content') || 'Sin título';

  const regexLow = /setVideoUrlLow'(https:\/\/[^']+)'/.exec(html);
  const regexHLS = /setVideoHLS'(https:\/\/[^']+)'/.exec(html);

  const files = {
    low: regexLow?.[1] || null,
    HLS: regexHLS?.[1] || null
  };

  if (!files.low && !files.HLS) throw new Error('No se encontró la URL de video.');

  return {
    status: 200,
    result: { title, URL, files }
  };
}
