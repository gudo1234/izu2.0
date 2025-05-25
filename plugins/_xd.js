/*import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

const handler = async (m, { conn }) => {
  try {
    const stikerxd = [
      'https://telegra.ph/file/e8be85aeb9a625f533a4a.png',
      'https://telegra.ph/file/913f5861cefbdde379921.jpg',
      'https://telegra.ph/file/6b7b0dbf022ee46a44887.jpg'
    ]
    
    const url = pickRandom(stikerxd)
    const imgBuffer = await fetch(url).then(res => res.buffer())
    const webpBuffer = await sticker(imgBuffer, false, global.packname, global.author)

    await conn.sendMessage(
      m.chat,
      { sticker: webpBuffer },
      { quoted: m }
    )
  } catch (e) {
    console.error('Error al enviar sticker xd:', e)
  }
}

handler.customPrefix = /xd/
handler.command = new RegExp

export default handler*/

import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'
import cheerio from 'cheerio'

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

async function buscarImagenXD() {
  const query = 'xd meme'
  const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const html = await res.text()

  const $ = cheerio.load(html)
  const scripts = $('script:not([src])').get()
  const scriptWithData = scripts.find(script => $(script).html().includes('var o'))

  if (!scriptWithData) return null

  const match = $(scriptWithData).html().match(/"image":"(.*?)"/g)
  if (!match) return null

  const urls = match.map(e => e.replace(/"image":"(.*?)"/, '$1').replace(/\\u002F/g, '/'))
  return pickRandom(urls)
}

const handler = async (m, { conn }) => {
  try {
    const imageUrl = await buscarImagenXD()
    if (!imageUrl) throw new Error('No se pudo obtener imagen XD')

    const imgBuffer = await fetch(imageUrl).then(res => res.buffer())
    const webpBuffer = await sticker(imgBuffer, false, global.packname, global.author)

    await conn.sendMessage(
      m.chat,
      { sticker: webpBuffer },
      { quoted: m }
    )
  } catch (e) {
    console.error('Error al enviar sticker xd:', e)
    await m.reply('No pude generar un sticker XD en este momento.')
  }
}

handler.customPrefix = /xd/
handler.command = new RegExp

export default handler
