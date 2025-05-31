import { sticker } from '../lib/sticker.js'

let handler = m => m

handler.all = async function (m, { conn }) {
  let chat = db.data.chats[m.chat]
  if (!chat.autosticker || !m.isGroup) return

  let mime = (m.msg || m).mimetype || m.mediaType || ''
  let stiker = false
  const name = m.pushName || 'Sticker'

  try {
    if (/webp/g.test(mime)) return

    if (/image/g.test(mime)) {
      const img = await m.download?.()
      if (!img) return
      stiker = await sticker(img, false, name, name)
    } else if (/video/g.test(mime)) {
      const video = await m.download()
      if (!video) return
      stiker = await sticker(video, false, name, name)
    } else if (isUrl(m.text)) {
      const url = m.text.split(/\n| /i)[0]
      stiker = await sticker(false, url, name, name)
    }

    if (stiker) {
      await conn.sendMessage(
        m.chat,
        { sticker: stiker },
        { quoted: m }
      )
    }
  } catch (e) {
    console.error('Error al generar autosticker:', e)
  }

  return !0
}

export default handler

const isUrl = (text = '') =>
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png|mp4)/gi.test(text)
