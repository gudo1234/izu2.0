import axios from 'axios'
import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js' // tu función de stickers

// 🔹 API de Pinterest Dorratz (solo imágenes)
const pins = async (query) => {
  try {
    const res = await axios.get(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(query)}`)
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(i => i.image_large_url || i.image_medium_url || i.image_small_url).filter(Boolean)
    }
    return []
  } catch (error) {
    console.error('Error API Dorratz:', error)
    return []
  }
}

let handler = async (m, { text, conn, command, usedPrefix }) => {
  const e = '❌'

  if (!text) return conn.reply(m.chat, `${e} Ingresa texto o URL de Pinterest.\n\nEjemplo:\n${usedPrefix + command} gatitos`, m)

  await m.react('🕒')

  try {
    // Solo texto → búsqueda de imágenes
    const results = await pins(text)
    if (!results || results.length === 0) return conn.reply(m.chat, `No se encontraron resultados para "${text}".`, m)

    // Elegir una imagen random
    const randomUrl = results[Math.floor(Math.random() * results.length)]
    const imgBuffer = await (await fetch(randomUrl)).buffer()

    // Generar sticker
    const stkr = await sticker(imgBuffer, { packname: 'Pinterest', author: text })

    // Enviar sticker
    await conn.sendMessage(m.chat, { sticker: stkr }, { quoted: m })

    await m.react('✅')
  } catch (error) {
    console.error('Error Pinterest Sticker:', error)
    await m.react('❌')
    m.reply(`❌ Error: ${error.message}`)
  }
}

handler.command = ['pinstiker']

export default handler
