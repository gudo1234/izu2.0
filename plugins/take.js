import { addExif } from '../lib/sticker.js'
let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `${e} Responda a un sticker para personalizarlo`, m)
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
  if (stiker) conn.sendFile(m.chat, stiker, 'wm.webp', '',m, true, { contextInfo: { 'forwardingScore': 200, 'isForwarded': false, externalAdReply:{ showAdAttribution: false, title: `${m.pushName}`, body: textbot, mediaType: 2, sourceUrl: redes, thumbnail: icons}}}, { quoted: m })
    else throw '⚠️ *_La conversión falló._*'
  }
}

handler.command = ['take', 'robar', 'wm']
handler.group = true;

export default handler
