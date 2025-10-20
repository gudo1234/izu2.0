import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

const handler = async (m, { conn }) => {
  const stikerxd = [
    'https://telegra.ph/file/e8be85aeb9a625f533a4a.png',
    'https://telegra.ph/file/913f5861cefbdde379921.jpg',
    'https://telegra.ph/file/6b7b0dbf022ee46a44887.jpg',
    'https://raw.githubusercontent.com/El-brayan502/dat1/main/uploads/607d73-1760989108389.png',
    'https://raw.githubusercontent.com/El-brayan502/dat2/main/uploads/2194fe-1760989083502.png'
  ]
  
  const url = pickRandom(stikerxd)
  const imgBuffer = await fetch(url).then(res => res.buffer())
  const webpBuffer = await sticker(imgBuffer, false, `${m.pushName}`)

  await conn.sendMessage(m.chat, { sticker: webpBuffer }, { quoted: m })
}

handler.customPrefix = /xd|xdd|xdddd/
handler.command = new RegExp()
export default handler
