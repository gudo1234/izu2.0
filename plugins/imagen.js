/*import { googleImage } from '@bochilteam/scraper'
import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `Proporciona una búsqueda para enviar imágenes de la web\n\n` +
      `*Ejemplo:* ${usedPrefix + command} carros`,
      m
    )
  }

  m.react('🕒')
  const res = await googleImage(text)
  const count = 9
  const promises = Array.from({ length: count }).map(() => res.getRandom())
  const links = await Promise.all(promises)

  for (let i = 0; i < links.length; i++) {
    try {
      const url = links[i]
      const imgBuffer = await fetch(url).then(r => r.buffer())
m.react('✅')
      await conn.sendMessage(
        m.chat,
        {
          image: imgBuffer,
          caption: i === 0 ? `9 Resultados para: "${text}"` : undefined
        },
        { quoted: m }
      )
    } catch (err) {
      console.error(`Error al enviar imagen ${i + 1}:`, err)
    }
  }
}

handler.command = ['imagenes', 'images', 'imagen', 'image']
handler.group = true

export default handler*/

import { googleImage } from '@bochilteam/scraper'
import fetch from 'node-fetch'
import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const username = `${conn.getName(m.sender)}`
  const basePrompt = `Eres un moderador de IA confiable. Tu tarea es analizar peticiones de usuarios y decidir si contienen contenido delicado o inapropiado como pornografía, violencia explícita, racismo, etc.`

  if (!text) {
    return conn.reply(
      m.chat,
      `Proporciona una búsqueda para enviar imágenes de la web\n\n` +
      `*Ejemplo:* ${usedPrefix + command} carros`,
      m
    )
  }

  // 🔍 Detección de contenido sensible por IA
  try {
    const prompt = `${basePrompt}\n\nTexto a evaluar: "${text}"\n¿Este texto tiene contenido sensible? Responde solo con: sí o no.`
    const respuesta = await luminsesi(text, username, prompt)

    if (/^s[ií]/i.test(respuesta)) {
      return m.reply(`${e} *Búsqueda bloqueada*, no se puede compartir contenido delicado.`)
    }
  } catch (e) {
    console.error('Error al verificar contenido sensible:', e)
    return m.reply('Ocurrió un error al verificar la búsqueda.')
  }

  m.react('🕒')
  const res = await googleImage(text)
  const count = 9
  const promises = Array.from({ length: count }).map(() => res.getRandom())
  const links = await Promise.all(promises)

  for (let i = 0; i < links.length; i++) {
    try {
      const url = links[i]
      const imgBuffer = await fetch(url).then(r => r.buffer())
      m.react('✅')
      await conn.sendMessage(
        m.chat,
        {
          image: imgBuffer,
          caption: i === 0 ? `9 Resultados para: "${text}"` : undefined
        },
        { quoted: m }
      )
    } catch (err) {
      console.error(`Error al enviar imagen ${i + 1}:`, err)
    }
  }
}

handler.command = ['imagenes', 'images', 'imagen', 'image']
handler.group = true

export default handler

// --- función IA para detectar si hay contenido sensible ---
async function luminsesi(content, username, prompt) {
  try {
    const response = await axios.post("https://Luminai.my.id", {
      content,
      user: username,
      prompt,
      webSearchMode: false
    })
    return response.data.result
  } catch (error) {
    console.error('Error al usar Luminai:', error)
    throw error
  }
}
