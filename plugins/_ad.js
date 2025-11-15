import axios from 'axios'
import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

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

// 🔹 Función principal que inicia el ciclo automático
export const startAutoStickers = async (conn) => {
  if (yaIniciado) return
  yaIniciado = true

  const INTERVAL = 1 * 60 * 1000 // 30 minutos
  const PAUSE = 2 * 60 * 1000     // 2 minutos entre grupos
  const myJID = '50495351584@s.whatsapp.net' // tu número

  const sendStickersCycle = async () => {
    try {
      // Primero enviar a tu PV
      await sendRandomSticker(conn, myJID)

      // Luego enviar a todos los grupos
      const chats = Object.keys(conn.chats).filter(id => id.endsWith('@g.us'))
      for (let i = 0; i < chats.length; i++) {
        await sendRandomSticker(conn, chats[i])
        if (i < chats.length - 1) await new Promise(r => setTimeout(r, PAUSE))
      }
    } catch (e) {
      console.log('Error en ciclo de stickers:', e)
    }
  }

  // Ejecutar inmediatamente y luego cada 30 minutos
  sendStickersCycle()
  setInterval(sendStickersCycle, INTERVAL)
}
