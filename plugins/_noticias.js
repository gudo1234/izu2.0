import fetch from 'node-fetch'
import cheerio from 'cheerio'

let handler = async (m, { conn }) => {
  const res = await fetch('https://www.fcbarcelona.com/en/news')
  const html = await res.text()
  const $ = cheerio.load(html)

  const noticias = []

  $('.featured-article, .article').each((i, el) => {
    if (i >= 5) return false // solo las 5 primeras
    const title = $(el).find('h2, h3').text().trim()
    const link = 'https://www.fcbarcelona.com' + ($(el).find('a').attr('href') || '')
    const img = $(el).find('img').attr('src')?.startsWith('http') ? $(el).find('img').attr('src') : 'https://www.fcbarcelona.com' + $(el).find('img').attr('src')
    if (title && link) noticias.push({ title, link, img })
  })

  if (!noticias.length) return m.reply('No se encontraron noticias recientes.')

  for (let noticia of noticias) {
    await conn.sendMessage(m.chat, {
      image: { url: noticia.img },
      caption: `*${noticia.title}*\n${noticia.link}`,
    }, { quoted: m })
  }
}

handler.command = ['noticiasbarca', 'barcanews', 'barca']
export default handler
