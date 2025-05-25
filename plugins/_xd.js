import fetch from 'node-fetch'
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

export default handler
