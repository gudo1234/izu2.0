import { addExif } from '../lib/sticker.js'
let handler = async (m, { conn, text }) => {
  if (!m.quoted) throw `${e} *_Responde a un sticker_*`
  let stiker = false
  try {
    let [packname, ...author] = text.split('|')
    author = (author || []).join('|')
    let mime = m.quoted.mimetype || ''
    if (!/webp/.test(mime)) throw `${e} *_Responde a un sticker_*`
    let img = await m.quoted.download()
    if (!img) throw `${e} *_Responde a un sticker_*`
    stiker = await addExif(img, packname || '', author || '')
  } catch (e) {
    console.error(e)
    if (Buffer.isBuffer(e)) stiker = e
  } finally {
    if (stiker) conn.sendFile(m.chat, stiker, 'wm.webp', '', m, null, rcanal)
    else throw '⚠️ *_La conversión falló._*'
  }
}
handler.help = ['wm *<nombre>|<autor>*']
handler.tags = ['sticker']
handler.command = ['take', 'robar', 'wm']
handler.group = true;

export default handler