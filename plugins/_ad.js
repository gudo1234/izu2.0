import axios from 'axios'
import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

let yaIniciado = false
const themes = [
  'gatitos',
  'fondos de pantalla',
  'anonymous',
  'carros exóticos',
  'gato meme',
  'memes',
  'emojis de meme',
  'perro meme'
]

const pins = async (query) => {
  const res = await axios.get(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(query)}`)
  if (Array.isArray(res.data) && res.data.length > 0) {
    return res.data.map(i => i.image_large_url || i.image_medium_url || i.image_small_url).filter(Boolean)
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
    const PAUSE = 1 * 60 * 1000

    const PRIORITY_GROUP = '120363402969655890@g.us'
    const sendToGroups = async () => {
      await sendRandomSticker(conn, PRIORITY_GROUP)
      await new Promise(r => setTimeout(r, PAUSE))

      const chats = Object.keys(conn.chats).filter(id => id.endsWith('@g.us') && id !== PRIORITY_GROUP)
      for (let i = 0; i < chats.length; i++) {
        await sendRandomSticker(conn, chats[i])
        if (i < chats.length - 1) await new Promise(r => setTimeout(r, PAUSE))
      }
    }

    sendToGroups()
    setInterval(sendToGroups, INTERVAL)
  }
}

handler.before = handler
export default handler
