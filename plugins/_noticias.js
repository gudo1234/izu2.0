import fetch from 'node-fetch'
import cheerio from 'cheerio'

const scrapeSection = async (url, selector, titleSelector, imgSelector) => {
  const res = await fetch(url)
  const html = await res.text()
  const $ = cheerio.load(html)
  const items = []

  $(selector).each((i, el) => {
    if (i >= 3) return false
    const title = $(el).find(titleSelector).text().trim()
    const link = 'https://www.fcbarcelona.com' + $(el).find('a').attr('href')
    const img = $(el).find(imgSelector).attr('data-src') || $(el).find(imgSelector).attr('src')
    if (title && link && img) {
      items.push({ title, link, image: img })
    }
  })

  return items
}

let handler = async (m, { conn }) => {
  const [photos, videos, news] = await Promise.all([
    scrapeSection('https://www.fcbarcelona.com/en/football/first-team/photos', '.photo-card', '.photo-title', 'img'),
    scrapeSection('https://www.fcbarcelona.com/en/football/first-team/videos', '.video-card', '.video-title', 'img'),
    scrapeSection('https://www.fcbarcelona.com/en/football/first-team/news', '.featured-article', '.featured-article__title', 'img')
  ])

  const all = [...photos, ...videos, ...news]

  if (!all.length) return m.reply('No se encontraron publicaciones recientes del Barça.')

  for (let item of all) {
    await conn.sendMessage(m.chat, {
      image: { url: item.image },
      caption: `*${item.title}*\n\n${item.link}`
    }, { quoted: m })
  }
}

handler.command = ['noticiasbarca', 'barcanews', 'barca']
export default handler
