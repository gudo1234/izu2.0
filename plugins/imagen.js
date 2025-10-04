/*import { googleImage } from '@bochilteam/scraper'
import fetch from 'node-fetch'
import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const username = `${conn.getName(m.sender)}`
  const basePrompt = `Eres un moderador de IA confiable. Tu tarea es analizar peticiones de usuarios y decidir si contienen contenido delicado o inapropiado como pornografía, violencia explícita, racismo, etc.`

  if (!text) {
    return conn.reply(
      m.chat,
      `${e} Proporciona una búsqueda para enviar imágenes de la web\n\n` +
      `*Ejemplo:* \`${usedPrefix + command} carros\``,
      m
    )
  }
  try {
    const prompt = `${basePrompt}\n\nTexto a evaluar: "${text}"\n¿Este texto tiene contenido sensible? Responde solo con: sí o no.`
    const respuesta = await luminsesi(text, username, prompt)

    if (/^s[ií]/i.test(respuesta)) {
      return m.reply(`${e} *Búsqueda bloqueada*\n> No se puede compartir contenido delicado.`)
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
        }*/

import axios from 'axios'
import fetch from 'node-fetch'

const STELLAR_APIKEY = 'stellar-LgIsemtM' // tu apikey

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const username = conn.getName(m.sender)
  const e = '⚠️'

  // Mensaje si no hay texto
  if (!text) {
    return conn.reply(
      m.chat,
      `${e} Proporciona una búsqueda para enviar imágenes de la web.\n\n` +
      `*Ejemplo:* \`${usedPrefix + command} gatos\``,
      m
    )
  }

  // 🧠 Paso 1: detección de búsqueda no permitida
  const moderationPrompt = `
Eres un moderador de IA. Tu tarea es analizar la búsqueda del usuario y responder únicamente con "sí" o "no".
La respuesta será "sí" si contiene contenido prohibido o delicado como:
- pornografía, desnudos o erotismo
- violencia explícita, armas, sangre
- odio, racismo, drogas o lenguaje ofensivo

Texto a evaluar: "${text}"
Responde solo con: sí o no.
`

  try {
    const check = await stellarAI(moderationPrompt)
    if (/^s[ií]/i.test(check)) {
      return m.reply(`${e} *Búsqueda bloqueada*\n> No se puede compartir contenido sensible o inapropiado.`)
    }
  } catch (err) {
    console.error('Error al verificar contenido sensible:', err)
    return m.reply('Ocurrió un error al verificar la búsqueda.')
  }

  // 🖼️ Paso 2: obtener imágenes desde la API Stellar
  m.react('🕒')
  try {
    const apiURL = `https://api.stellarwa.xyz/search/googleimagen?query=${encodeURIComponent(text)}&apikey=${STELLAR_APIKEY}`
    const res = await axios.get(apiURL)

    if (!res.data?.data || !Array.isArray(res.data.data) || res.data.data.length === 0) {
      return m.reply(`${e} No se encontraron imágenes para "${text}".`)
    }

    const results = res.data.data.slice(0, 9) // máximo 9 resultados
    m.react('✅')

    for (let i = 0; i < results.length; i++) {
      const imgUrl = results[i]
      try {
        const imgBuffer = await fetch(imgUrl).then(r => r.buffer())
        await conn.sendMessage(
          m.chat,
          {
            image: imgBuffer,
            caption: i === 0 ? `🖼️ Resultados de búsqueda para: *${text}*` : undefined,
          },
          { quoted: m }
        )
      } catch (err) {
        console.error(`Error al enviar imagen ${i + 1}:`, err)
      }
    }
  } catch (error) {
    console.error('Error al obtener imágenes de Stellar:', error)
    m.reply('⚠️ Error al buscar imágenes, intenta más tarde.')
  }
}

handler.command = ['imagenes', 'images', 'imagen', 'image']
handler.group = true

export default handler

// 🌟 Función auxiliar: consulta a la IA de Stellar para moderación o análisis
async function stellarAI(prompt) {
  try {
    const response = await axios.get(
      `https://api.stellarwa.xyz/ai/chatgpt?text=${encodeURIComponent(prompt)}&apikey=${STELLAR_APIKEY}`
    )
    return (
      response.data?.result ||
      response.data?.data ||
      'no'
    )
  } catch (error) {
    console.error('Error en Stellar AI:', error?.response?.data || error.message)
    throw error
  }
}
