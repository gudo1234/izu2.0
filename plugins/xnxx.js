import fetch from 'node-fetch';
import cheerio from 'cheerio';

const handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!db.data.chats[m.chat].nsfw && m.isGroup) {
    return conn.reply(m.chat, `El contenido *NSFW* está desactivado en este grupo.\nUn administrador puede activarlo con el comando » *#nsfw on*`, m);
  }

  if (!text) {
    return conn.reply(m.chat, `Por favor, ingresa una búsqueda o un enlace.\nEjemplo: *${usedPrefix + command} colegiala*`, m);
  }

  try {
    await conn.reply(m.chat, 'Buscando y procesando video, espera un momento...', m);

    let url = '';
    if (text.includes('xnxx.com/video-')) {
      url = text;
    } else {
      const search = await xnxxsearch(text);
      if (!search.result.length) throw new Error('No se encontraron resultados.');

      // Escoge el primer resultado (o aleatorio entre los primeros 5 si prefieres)
      const video = search.result[Math.floor(Math.random() * Math.min(5, search.result.length))];
      url = video.link;
    }

    const videoData = await xnxxdl(url);
    const file = videoData.result.files.high;
    if (!file) throw new Error('No se encontró la URL de alta calidad.');

    await conn.sendMessage(m.chat, {
      document: { url: file },
      mimetype: 'video/mp4',
      fileName: `${videoData.result.title}.mp4`
    }, { quoted: m });

  } catch (e) {
    const line = e.stack?.split('\n')[1]?.trim() || 'línea desconocida';
    return conn.reply(m.chat, 
      `Ocurrió un error en el proceso:\n\n*Error:* ${e.message}\n*Línea:* ${line}\n\nPosibles causas:\n- El video no tiene enlace directo.\n- El HTML de la página cambió.\n- El término de búsqueda no devolvió resultados.`, m);
  }
};

handler.command = ['xnxx'];
handler.group = true;
export default handler;

// ========== FUNCIONES AUXILIARES ========== //

async function xnxxsearch(query) {
  const baseurl = 'https://www.xnxx.com';
  const page = Math.floor(Math.random() * 3) + 1;
  const res = await fetch(`${baseurl}/search/${encodeURIComponent(query)}/${page}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const results = [];

  $('div.mozaique > div').each((i, el) => {
    const a = $(el).find('a');
    const href = a.attr('href');
    const title = a.attr('title');
    const info = $(el).find('p.metadata').text().trim();
    if (href && title && href.includes('/video-')) {
      results.push({ title, info, link: baseurl + href });
    }
  });

  if (!results.length) throw new Error('No se encontraron resultados.');
  return { code: 200, status: true, result: results };
}

async function xnxxdl(URL) {
  const res = await fetch(URL);
  const html = await res.text();
  const $ = cheerio.load(html);
  const title = $('meta[property="og:title"]').attr('content') || 'video';
  const script = $('#video-player-bg > script').html();
  const high = (script.match(/html5player\.setVideoUrlHigh'(.*?)'/) || [])[1];

  if (!high) throw new Error('No se encontró la URL de alta calidad.');
  
  return {
    status: 200,
    result: {
      title,
      files: { high }
    }
  };
}
