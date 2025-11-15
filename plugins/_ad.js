import axios from 'axios'
import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js' // tu función de sticker

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

  if (!text) return conn.reply(
    m.chat,
    `${e} Ingresa texto para buscar stickers de Pinterest.\n\nEjemplo: ${usedPrefix + command} gatos`,
    m
  )

  await m.react('🕒')

  try {
    const results = await pins(text)
    if (!results || results.length === 0) return conn.reply(m.chat, `No se encontraron resultados para "${text}".`, m)

    // Elegir una imagen random
    const randomUrl = results[Math.floor(Math.random() * results.length)]
    const imgBuffer = await fetch(randomUrl).then(r => r.buffer())

    // Generar sticker
    const webpBuffer = await sticker(imgBuffer, false, text)

    // Enviar sticker
    await conn.sendMessage(
      m.chat,
      { sticker: webpBuffer },
      { quoted: m }
    )

    await m.react('✅')
  } catch (err) {
    console.error('Error al enviar sticker de Pinterest:', err)
    await m.react('❌')
    m.reply(`❌ Error: ${err.message}`)
  }
}

handler.command = ['pinstiker']
export default handler
