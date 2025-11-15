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
  } catch (err) {
    console.log('Error API Dorratz:', err)
    return []
  }
}

// Función para enviar un sticker random a tu número
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
  } catch (err) {
    console.log('Error enviando sticker:', err)
  }
}

let handler = async (m, { conn }) => {
  // Esto solo sirve para inicializar una vez
  if (!yaIniciado) {
    yaIniciado = true

    const MY_JID = '50495351584@s.whatsapp.net' // tu número privado
    const INTERVAL = 1 * 60 * 1000 // 30 minutos

    setInterval(async () => {
      await sendRandomSticker(conn, MY_JID)
    }, INTERVAL)

    // Enviar inmediatamente al iniciar
    await sendRandomSticker(conn, MY_JID)
  }
}

handler.before = handler
export default handler
