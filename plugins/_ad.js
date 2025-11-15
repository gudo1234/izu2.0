import axios from 'axios'
import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

let yaIniciado = false
const themes = [
  'gatitos',
  'memes Perú',
  'anonymous',
  'chicas sexi',
  'gato meme',
  'memes',
  'emojis de meme',
  'perro meme',
  'bob el constructor meme'
]
const GRUPOS_OBJETIVO = [
  '120363402969655890@g.us',
  '120363313839400966@g.us',
  '120363415729116829@g.us'
]
const pins = async (query) => {
  const res = await axios.get(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(query)}`)
  if (Array.isArray(res.data) && res.data.length > 0) {
    return res.data.map(i =>
      i.image_large_url || i.image_medium_url || i.image_small_url
    ).filter(Boolean)
  }
  return []
}
const sendRandomSticker = async (conn, jid) => {
  const theme = themes[Math.floor(Math.random() * themes.length)]
  const results = await pins(theme)
  if (!results || results.length === 0) return

  const randomUrl = results[Math.floor(Math.random() * results.length)]
  const imgBuffer = await fetch(randomUrl).then(r => r.buffer())
  const webpBuffer = await sticker(imgBuffer, false, wm)

  await conn.sendMessage(jid, { sticker: webpBuffer })
}

let handler = async (m, { conn }) => {
  if (!yaIniciado) {
    yaIniciado = true

    const INTERVAL = 40 * 60 * 1000
    const PAUSE = 2 * 60 * 1000

    const sendToGroups = async () => {
      for (let i = 0; i < GRUPOS_OBJETIVO.length; i++) {
        await sendRandomSticker(conn, GRUPOS_OBJETIVO[i])

        if (i < GRUPOS_OBJETIVO.length - 1) {
          await new Promise(r => setTimeout(r, PAUSE))
        }
      }
    }

    sendToGroups()
    setInterval(sendToGroups, INTERVAL)
  }
}

handler.before = handler
export default handler
