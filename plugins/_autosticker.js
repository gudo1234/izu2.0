import { sticker } from '../lib/sticker.js'

let handler = m => m

handler.all = async function (m) {
  if (!m.isGroup) return

  let q = m
  let stiker = false
  let mime = (q.msg || q).mimetype || q.mediaType || ''

  if (/webp/.test(mime)) return

  try {
    const packname = 'IzuBot'
    const author = 'whatsapp-bot'

    if (/image/.test(mime)) {
      let img = await q.download?.()
      if (!img) return
      stiker = await sticker(img, false, packname, author)
    } else if (/video/.test(mime)) {
      let vid = await q.download?.()
      if (!vid) return
      stiker = await sticker(vid, false, packname, author)
    } else if (m.text) {
      let url = m.text.split(/\n| /i)[0]
      if (isUrl(url)) {
        stiker = await sticker(false, url, packname, author)
      }
    }

    if (stiker) {
      await this.sendFile(m.chat, stiker, null, { asSticker: true })
    }
  } catch (e) {
    console.error('Error generando sticker:', e)
  }

  return !0
}

export default handler

const isUrl = (text = '') => {
  return /^https?:\/\/.+\.(jpe?g|gif|png|mp4)$/i.test(text)
    }
