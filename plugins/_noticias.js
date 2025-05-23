import fetch from 'node-fetch'
import cheerio from 'cheerio'

let handler = async (m, { conn }) => {
  const res = await fetch('https://nitter.net/FCBarcelona') // Twitter alternativo sin login
  const html = await res.text()
  const $ = cheerio.load(html)

  const tweets = []

  $('.timeline-item').each((i, el) => {
    if (i >= 3) return false // Solo los 3 más recientes
    const content = $(el).find('.tweet-content').text().trim()
    const link = 'https://twitter.com/FCBarcelona/status/' + $(el).find('a[href*="/status/"]').attr('href')?.split('/').pop()
    const image = $(el).find('.attachment.image img').attr('src')
    if (content && link) tweets.push({
      content,
      link,
      image: image ? 'https://nitter.net' + image : null
    })
  })

  if (!tweets.length) return m.reply('No se encontraron noticias recientes en el Twitter del Barça.')

  for (let tweet of tweets) {
    await conn.sendMessage(m.chat, {
      image: tweet.image ? { url: tweet.image } : null,
      caption: `*${tweet.content}*\n\n${tweet.link}`
    }, { quoted: m })
  }
}

handler.command = ['noticiasbarca', 'barcanews', 'barca']
export default handler
