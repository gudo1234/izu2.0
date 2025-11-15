import axios from 'axios'
import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js' // tu función sticker

let yaIniciado = false

// Temas de Pinterest
const themes = [
  'gatitos',
  'fondos de pantalla',
  'anonymous',
  'carros exóticos',
  'chicos bélicos',
  'memes',
  'emojis de meme'
]

// Función para obtener imágenes de Pinterest
const pins = async (query) => {
  try {
    const res = await axios.get(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(query)}`)
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(i => i.image_large_url || i.image_medium_url || i.image_small_url).filter(Boolean)
    }
    return []
  } catch (e) {
    console.log('Error API Dorratz:', e)
    return []
  }
}

// Función para enviar sticker a un chat
const sendRandomSticker = async (conn, jid) => {
  try {
    const theme = themes[Math.floor(Math.random() * themes.length)]
    const results = await pins(theme)
    if (!results || results.length === 0) return

    const randomUrl = results[Math.floor(Math.random() * results.length)]
    const imgBuffer = await fetch(randomUrl).then(r => r.buffer())
    const webpBuffer = await sticker(imgBuffer, false, theme)

    await conn.sendMessage(jid, { sticker: webpBuffer })
    console.log(`Sticker enviado a ${jid} con tema "${theme}"`)
  } catch (e) {
    console.log(`Error enviando sticker a ${jid}:`, e)
  }
}

let handler = async (m, { conn }) => {
  if (!m.isGroup) return

  if (!yaIniciado) {
    yaIniciado = true

    setInterval(async () => {
      try {
        // Obtener todos los grupos
        const chats = Object.keys(conn.chats).filter(id => id.endsWith('@g.us'))

        for (let i = 0; i < chats.length; i++) {
          await sendRandomSticker(conn, chats[i])
          if (i < chats.length - 1) {
            // Pausa de 2 minutos entre cada grupo
            await new Promise(res => setTimeout(res, 2 * 60 * 1000))
          }
        }

      } catch (e) {
        console.log('Error al enviar stickers automáticos:', e)
      }
    }, 30 * 60 * 1000) // cada 30 minutos
  }
}

handler.before = handler
export default handler
