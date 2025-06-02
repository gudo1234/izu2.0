import axios from 'axios';
import cheerio from 'cheerio';

const handler = async (m, { conn, text, command }) => {
  if (!text) {
    return m.reply('❌ Por favor, proporciona el nombre de la canción que deseas buscar.\n\n📌 Ejemplo: *.play diles bad bunny*');
  }

  await m.react('🔍');

  try {
    const query = text.trim().toLowerCase().replace(/\s+/g, '-');
    const searchUrl = `https://es.mygomp3.com/mp3/${encodeURIComponent(query)}.html`;

    const searchResponse = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(searchResponse.data);
    const firstResult = $('div.media').first();

    if (!firstResult.length) {
      return m.reply('❌ No se encontró ninguna canción con ese nombre.');
    }

    const title = firstResult.find('.media-body > h3 > a').text().trim();
    const link = 'https://es.mygomp3.com' + firstResult.find('.media-body > h3 > a').attr('href');
    const duration = firstResult.find('.media-body > .duration').text().trim();
    const thumbnail = firstResult.find('img').attr('src');

    const detailResponse = await axios.get(link, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $$ = cheerio.load(detailResponse.data);
    const downloadLink = $$('a.btn.btn-primary.btn-lg[href^="https://cdn"]').attr('href');

    if (!downloadLink) {
      return m.reply('❌ No se pudo obtener el enlace de descarga.');
    }

    const caption = `🎶 *Resultado encontrado:*\n\n📌 *Título:* ${title}\n⏱️ *Duración:* ${duration}\n🔗 *Enlace:* ${link}\n\n⏬ *Enviando audio...*`;

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption,
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      audio: { url: downloadLink },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m });

    await m.react('✅');
  } catch (error) {
    console.error(error);
    m.reply('❌ Ocurrió un error al procesar la descarga.');
  }
};

handler.command = ['pene'];
handler.group = true;
export default handler;
