import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn }) => {
  // Lista de URLs de imágenes estilo "xd"
  const urls = [
    'https://i.imgur.com/FpH7P2K.png',
    'https://i.imgur.com/Cn5QK0g.png',
    'https://i.imgur.com/vZ8FVKO.png',
    'https://i.imgur.com/GSPkQyz.png',
    'https://i.imgur.com/Va6Wy8j.png'
  ]

  // Elegir una aleatoriamente
  let url = urls[Math.floor(Math.random() * urls.length)]

  // Generar el sticker
  let stiker = await sticker(url, false, global.packname, global.author)
  if (stiker) {
    await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
  }
}

handler.customPrefix = /xd|xdd|xddd/
handler.command = new RegExp
export default handler
