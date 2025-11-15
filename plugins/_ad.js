import makeWASocket from '@whiskeysockets/baileys'
import axios from 'axios'
import fetch from 'node-fetch'
import { sticker } from './lib/sticker.js' // aquí tu función sticker

// 🔹 Temas de Pinterest
const themes = [
  'gatitos',
  'fondos de pantalla',
  'anonymous',
  'carros exóticos',
  'chicos bélicos',
  'memes',
  'emojis de meme'
]

// 🔹 Función para buscar imágenes en Pinterest
const pins = async (query) => {
  try {
    const res = await axios.get(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(query)}`)
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(i => i.image_large_url || i.image_medium_url || i.image_small_url).filter(Boolean)
    }
    return []
  } catch (err) {
    console.error('Error API Dorratz:', err)
    return []
  }
}

// 🔹 Función para enviar sticker a un chat
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
    console.error(`Error enviando sticker a ${jid}:`, err)
  }
}

// 🔹 Función principal
const startBot = async () => {
  const conn = makeWASocket() // Inicializa Baileys

  const TEST_NUMBER = '50495351584@s.whatsapp.net' // tu número en JID
  const INTERVAL = 60 * 1000 // 1 minuto para prueba

  // Función que envía sticker al test number
  const sendToTestNumber = async () => {
    await sendRandomSticker(conn, TEST_NUMBER)
  }

  sendToTestNumber() // enviar inmediatamente
  setInterval(sendToTestNumber, INTERVAL) // luego cada minuto
}

startBot()
