import fetch from 'node-fetch'
import cheerio from 'cheerio'

async function googleSearch(query) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=es`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  })
  const html = await res.text()
  return html
}

async function parseNoticiasBarca() {
  const html = await googleSearch('últimas noticias FC Barcelona')
  const $ = cheerio.load(html)
  let noticias = []
  $('.BVG0Nb').each((i, el) => {
    if (i >= 3) return false // solo las 3 primeras noticias
    const title = $(el).find('.nDgy9d').text() || $(el).find('div[role="heading"]').text()
    const link = $(el).find('a').attr('href')
    if (title && link) noticias.push({ title, link })
  })
  return noticias
}

async function parseResultadosBarca() {
  const html = await googleSearch('resultado último partido FC Barcelona')
  const $ = cheerio.load(html)
  let resultado = ''
  // Intentamos extraer el resultado rápido de Google
  const marcador = $('.imso_mh__score').first().text()
  const equipos = $('.imso_mh__team-name').toArray().map(e => $(e).text()).join(' vs ')
  if (marcador && equipos) resultado = `${equipos}: ${marcador}`
  else resultado = 'No se encontró resultado reciente.'
  return resultado
}

let handlerNoticias = async (m, { conn }) => {
  try {
    const noticias = await parseNoticiasBarca()
    if (!noticias.length) return m.reply('No se encontraron noticias recientes del Barça.')
    let texto = '*Últimas noticias del FC Barcelona:*\n\n'
    noticias.forEach((n, i) => {
      texto += `*${i + 1}. ${n.title}*\n${n.link}\n\n`
    })
    await conn.sendMessage(m.chat, { text: texto }, { quoted: m })
  } catch (e) {
    m.reply('Error al obtener noticias del Barça.')
  }
}

let handlerBarca = async (m, { conn }) => {
  try {
    const resultado = await parseResultadosBarca()
    await conn.sendMessage(m.chat, { text: `*Último resultado del FC Barcelona:*\n${resultado}` }, { quoted: m })
  } catch (e) {
    m.reply('Error al obtener el resultado del Barça.')
  }
}

handler.command = ['barca']

export default handler
