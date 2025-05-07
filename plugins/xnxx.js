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
    await conn.reply(m.chat, `Buscando y procesando el video, espera un momento...`, m);

    let videoData = null;

    if (text.includes('xnxx.com')) {
      // Si es un link directo
      try {
        const res = await xnxxdl(text);
        videoData = { title: res.result.title, url: res.result.files.high };
      } catch (err) {
        throw new Error(`Error al procesar el enlace directo: ${err.message}`);
      }
    } else {
      // Búsqueda por texto
      const res = await xnxxsearch(text);
      const list = res.result;
      if (!list.length) throw new Error('No se encontraron resultados en la búsqueda.');

      // Escoge un video aleatorio
      const randomVideo = list[Math.floor(Math.random() * list.length)];

      try {
        const dl = await xnxxdl(randomVideo.link);
        videoData = { title: dl.result.title, url: dl.result.files.high };
      } catch (err) {
        throw new Error(`Error al intentar descargar el video encontrado: ${err.message}`);
      }
    }

    if (!videoData || !videoData.url) {
      throw new Error('No se pudo obtener el enlace de descarga del video.');
    }

    try {
      await conn.sendMessage(m.chat, {
        document: { url: videoData.url },
        mimetype: 'video/mp4',
        fileName: `${videoData.title}.mp4`
      }, { quoted: m });
    } catch (sendError) {
      throw new Error(`Error al enviar el video: ${sendError.message}`);
    }

  } catch (e) {
    return conn.reply(m.chat, `Ocurrió un error:\nFuente del error: ${e.message}`, m);
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
