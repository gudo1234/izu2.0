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
  'memes',
  'emojis de meme',
  'emojis funables de peru'
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
    //console.log(`Sticker enviado a ${jid} con tema "${theme}"`)
  } catch (err) {
    //console.log(`Error enviando sticker a ${jid}:`, err)
  }
}

let handler = async (m, { conn }) => {
  // Solo inicializar una vez
  if (!yaIniciado) {
    yaIniciado = true

    const INTERVAL = 30 * 60 * 1000 // 30 minutos
    const PAUSE = 2 * 60 * 1000     // 2 minutos entre cada grupo

    const sendToGroups = async () => {
      try {
        // Obtener solo chats de grupos
        const chats = Object.keys(conn.chats).filter(id => id.endsWith('@g.us'))

        for (let i = 0; i < chats.length; i++) {
          await sendRandomSticker(conn, chats[i])

          // Pausa de 2 minutos solo entre grupos
          if (i < chats.length - 1) {
            await new Promise(r => setTimeout(r, PAUSE))
          }
        }
      } catch (err) {
        //console.log('Error en envío automático a grupos:', err)
      }
    }

    // Ejecutar inmediatamente y luego cada 30 minutos
    sendToGroups()
    setInterval(sendToGroups, INTERVAL)
  }
}

handler.before = handler
export default handler
