import fetch from 'node-fetch';
import cheerio from 'cheerio';

const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!db.data.chats[m.chat].nsfw && m.isGroup) {
    return conn.reply(m.chat, `El contenido *NSFW* está desactivado en este grupo.\nUn admin puede activarlo con: *${usedPrefix}nsfw on*`, m);
  }

  if (!text) {
    return conn.reply(m.chat, `Por favor, ingresa un término o un enlace de Xnxx.\nEjemplo: *${usedPrefix + command} colegiala latina*`, m);
  }

  try {
    await conn.reply(m.chat, `Buscando y descargando 5 videos aleatorios, espera un momento...`, m);

    let videos = [];

    if (text.includes('xnxx.com')) {
      // Si es link directo, solo descarga ese
      const res = await xnxxdl(text);
      videos.push({title: res.result.title, url: res.result.files.high});
    } else {
      // Búsqueda por texto
      const res = await xnxxsearch(text);
      const list = res.result;
      if (!list.length) throw new Error('No se encontraron resultados.');

      // Mezclar aleatoriamente y seleccionar 5
      const shuffled = list.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);

      for (const vid of selected) {
        const dl = await xnxxdl(vid.link);
        videos.push({title: dl.result.title, url: dl.result.files.high});
      }
    }

    // Enviar videos uno por uno
    for (const v of videos) {
      if (!v.url) continue;
      await conn.sendMessage(m.chat, {
        document: { url: v.url },
        mimetype: 'video/mp4',
        fileName: `${v.title}.mp4`
      }, { quoted: m });
    }

  } catch (e) {
    return conn.reply(m.chat, `Ocurrió un error:\n${e.message}`, m);
  }
};

handler.command = ['xnxx'];
handler.group = true;

export default handler;

// Funciones auxiliares

async function xnxxsearch(query) {
  const baseurl = 'https://www.xnxx.com';
  const res = await fetch(`${baseurl}/search/${encodeURIComponent(query)}/${Math.floor(Math.random() * 3) + 1}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const results = [];
  $('div.mozaique div.thumb').each((i, el) => {
    const link = baseurl + $(el).find('a').attr('href').replace('/THUMBNUM/', '/');
    const title = $(el).find('a').attr('title') || 'Sin título';
    const info = $(el).find('p.metadata').text() || 'Sin info';
    results.push({title, info, link});
  });

  return {code: 200, status: true, result: results};
}

async function xnxxdl(URL) {
  const res = await fetch(URL);
  const html = await res.text();
  const $ = cheerio.load(html);
  const videoScript = $('#video-player-bg > script:nth-child(6)').html();
  const files = {
    low: (videoScript.match(/html5player\.setVideoUrlLow'(.*?)'/) || [])[1],
    high: (videoScript.match(/html5player\.setVideoUrlHigh'(.*?)'/) || [])[1],
  };
  const title = $('meta[property="og:title"]').attr('content') || 'video_xnxx';
  return {status: 200, result: {title, files}};
}
