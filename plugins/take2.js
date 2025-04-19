import { addExif } from '../lib/sticker.js'
let handler = async (m, { conn, text }) => {
  let isSticker = `${e} *_Responde a un sticker_*`
  if (!m.quoted) throw isSticker
  let stiker = false
  try {
    let mime = m.quoted.mimetype || ''
    if (!/webp/.test(mime)) throw isSticker
    let img = await m.quoted.download()
    if (!img) throw isSticker
    stiker = await addExif(img, packname || ”, author || ")
  } catch (e) {
    console.error(e)
    if (Buffer.isBuffer(e)) stiker = e
  } finally {
    if (stiker) conn.sendFile(m.chat, stiker, 'wm.webp', '', m)
    else throw '*La conversión falló*'
  }
}

handler.help = ['wm2']
handler.tags = ['sticker']
handler.command = ['take2', 'robar2', 'wm2']
handler.group = true;

export default handler