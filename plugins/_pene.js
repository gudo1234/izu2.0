import axios from 'axios';
import cheerio from 'cheerio';

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('❌ Ingresa el nombre de una canción.\n\n📌 Ejemplo: *.play diles bad bunny*');

  await m.react('🎵');

  try {
    const query = text.trim().toLowerCase().replace(/\s+/g, '-');
    const url = `https://es.mygomp3.com/mp3/${encodeURIComponent(query)}.html`;

    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(res.data);
    const resultado = $('div.media').first();

    if (!resultado.length) return m.reply('❌ No se encontró ninguna canción.');

    const titulo = resultado.find('.media-body > h3 > a').text().trim();
    const enlace = 'https://es.mygomp3.com' + resultado.find('.media-body > h3 > a').attr('href');
    const duracion = resultado.find('.media-body > .duration').text().trim();
    const thumb = resultado.find('img').attr('src');

    // Obtener el enlace de descarga desde la página interna
    const res2 = await axios.get(enlace, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $$ = cheerio.load(res2.data);
    const downloadLink = $$('a.btn.btn-primary.btn-lg[href^="https://cdn"]').attr('href');

    if (!downloadLink) return m.reply('❌ No se pudo obtener el enlace de descarga.');

    const caption = `🎶 *Resultado encontrado:*\n\n📌 *Título:* ${titulo}\n⏱️ *Duración:* ${duracion}\n🔗 *Enlace:* ${enlace}\n\n⏬ *Enviando audio...*`;

    await conn.sendMessage(m.chat, {
      image: { url: thumb },
      caption,
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      audio: { url: downloadLink },
      mimetype: 'audio/mpeg',
      fileName: `${titulo}.mp3`
    }, { quoted: m });

    await m.react('✅');
  } catch (err) {
    console.error(err);
    m.reply('❌ Ocurrió un error al procesar la descarga.');
  }
};

handler.command = ['pene'];
handler.group = true;
export default handler;
