import fetch from 'node-fetch';
import cheerio from 'cheerio';

const handler = async (m, {conn, text, usedPrefix, command}) => {
  try {
    if (!db.data.chats[m.chat].nsfw && m.isGroup) {
      return conn.reply(m.chat, `El contenido NSFW está desactivado en este grupo.\nActívalo con: *${usedPrefix}nsfw on*`, m);
    }

    if (!text) {
      return conn.reply(m.chat, `Envía una búsqueda. Ejemplo:\n${usedPrefix}${command} latina`, m);
    }

    // BUSQUEDA
    const res = await xnxxsearch(text);
    const resultados = res.result;

    if (!resultados || resultados.length === 0) {
      throw new Error('No se encontraron resultados para tu búsqueda.');
    }

    // VIDEO ALEATORIO
    const elegido = resultados[Math.floor(Math.random() * resultados.length)];

    await conn.reply(m.chat, `Buscando y descargando:\n*${elegido.title}*`, m);

    // DESCARGA
    const data = await xnxxdl(elegido.link);
    const video = data.result.files.high;

    if (!video) {
      throw new Error('No se pudo obtener el enlace de descarga del video.');
    }

    await conn.sendMessage(
      m.chat,
      {
        document: { url: video },
        mimetype: 'video/mp4',
        fileName: data.result.title || 'xnxx_video.mp4'
      },
      { quoted: m }
    );

  } catch (err) {
    const errorMsg = `Ocurrió un error en el proceso:\n\n` +
      `*Error:* ${err.message}\n` +
      `*Stack:* ${err.stack?.split('\n').slice(0, 2).join('\n')}\n\n` +
      `Posibles causas:\n- El video no tiene link directo.\n- El HTML de la página cambió.\n- El selector falló.\n\n` +
      `Intenta con otro término o revisa el código.`;

    return conn.reply(m.chat, errorMsg, m);
  }
};

handler.command = ['xnxx'];
handler.group = true;

export default handler;

// FUNCIONES
async function xnxxsearch(query) {
  const baseurl = 'https://www.xnxx.com';
  const page = Math.floor(Math.random() * 3) + 1;

  const res = await fetch(`${baseurl}/search/${encodeURIComponent(query)}/${page}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const results = [];

  $('div.mozaique div.thumb').each((_, el) => {
    const a = $(el).find('a');
    const link = baseurl + (a.attr('href') || '').replace('/THUMBNUM/', '/');
    const title = a.attr('title') || 'Sin título';
    const info = $(el).next('div.thumb-under').find('p.metadata').text() || 'Sin info';

    if (link && title) results.push({ title, info, link });
  });

  if (results.length === 0) throw new Error('No se encontraron videos.');

  return { code: 200, status: true, result: results };
}

async function xnxxdl(URL) {
  const res = await fetch(URL);
  const html = await res.text();
  const $ = cheerio.load(html);

  const videoScript = $('#video-player-bg > script:nth-child(6)').html();
  if (!videoScript) throw new Error('No se encontró el script del video.');

  const files = {
    low: (videoScript.match(/html5player\.setVideoUrlLow'(.*?)'/) || [])[1],
    high: (videoScript.match(/html5player\.setVideoUrlHigh'(.*?)'/) || [])[1]
  };

  if (!files.high) throw new Error('No se encontró la URL de alta calidad.');

  const title = $('meta[property="og:title"]').attr('content') || 'video_xnxx';

  return { status: 200, result: { title, files } };
}
