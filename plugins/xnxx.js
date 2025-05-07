import fetch from 'node-fetch';
import cheerio from 'cheerio';

const handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!db.data.chats[m.chat].nsfw && m.isGroup) {
    return conn.reply(m.chat, 'El contenido NSFW está desactivado en este grupo.', m);
  }

  if (!text) {
    return conn.reply(m.chat, `Uso: ${usedPrefix + command} <texto o URL>`, m);
  }

  try {
    let url = '';
    
    // Si es una URL directa
    if (text.includes('xnxx.com/video-')) {
      url = text;
    } else {
      // Buscar el primer resultado
      const resSearch = await xnxxsearch(text);
      if (!resSearch.result || !resSearch.result.length) {
        throw new Error('No se encontraron resultados.');
      }
      url = resSearch.result[0].link;
    }

    await conn.reply(m.chat, 'Procesando video, espera un momento...', m);

    const resDL = await xnxxdl(url);
    const video = resDL.result.files.high;
    if (!video) throw new Error('No se encontró la URL de alta calidad.');

    await conn.sendMessage(m.chat, {
      document: { url: video },
      mimetype: 'video/mp4',
      fileName: resDL.result.title + '.mp4'
    }, { quoted: m });

  } catch (err) {
    const stack = err.stack || err.message;
    conn.reply(m.chat, 
`Ocurrió un error en el proceso:

*Error:* ${err.message}
*Stack:* ${stack.split('\n')[1] || 'línea desconocida'}

Posibles causas:
- El video no tiene enlace directo.
- El HTML de la página cambió.
- El término de búsqueda no devolvió resultados.`, m);
  }
};

handler.command = ['xnxx'];
handler.group = true;
export default handler;

// Nueva función xnxxsearch robusta
async function xnxxsearch(query) {
  const baseurl = 'https://www.xnxx.com';
  const page = Math.floor(Math.random() * 3) + 1;
  const res = await fetch(`${baseurl}/search/${encodeURIComponent(query)}/${page}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const results = [];

  $('div.mozaique > div.video').each((i, el) => {
    const a = $(el).find('a');
    const href = a.attr('href');
    const title = a.attr('title');
    const info = $(el).find('p.metadata').text().trim();
    if (href && title) {
      results.push({ title, info, link: baseurl + href });
    }
  });

  if (!results.length) throw new Error('No se encontraron resultados.');
  return { code: 200, status: true, result: results };
}

// Función de descarga
async function xnxxdl(URL) {
  const res = await fetch(URL);
  const html = await res.text();
  const $ = cheerio.load(html);
  const title = $('meta[property="og:title"]').attr('content') || 'video';
  const script = $('#video-player-bg > script').html();
  const files = {
    low: (script.match(/html5player.setVideoUrlLow'(.*?)';/) || [])[1],
    high: (script.match(/html5player.setVideoUrlHigh'(.*?)';/) || [])[1],
  };
  if (!files.high) throw new Error('No se encontró la URL de alta calidad.');
  return { status: 200, result: { title, files } };
                                     }
