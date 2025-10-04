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
  const e = '⚠️'

  // 📝 Validación: texto vacío
  if (!text) {
    return conn.reply(
      m.chat,
      `${e} Proporciona una búsqueda para enviar imágenes de la web.\n\n` +
      `*Ejemplo:* \`${usedPrefix + command} gatos\``,
      m
    )
  }

  // 🧠 Paso 1: moderación (opcional)
  const moderationPrompt = `
Eres un moderador de IA. Analiza si el texto contiene contenido prohibido.
Responde solo con "sí" o "no".
Prohibido: pornografía, erotismo, desnudos, violencia, armas, drogas, racismo, odio o lenguaje ofensivo.

Texto: "${text}"
¿Contiene contenido sensible?
`

  try {
    const check = await stellarAI(moderationPrompt)
    if (/^s[ií]/i.test(check)) {
      return m.reply(`${e} *Búsqueda bloqueada*\n> No se puede compartir contenido sensible o inapropiado.`)
    }
  } catch (err) {
    console.error('Error al verificar contenido sensible:', err)
    return m.reply('⚠️ Error al verificar la búsqueda.')
  }

  // 🔍 Paso 2: búsqueda de imágenes con la API de Stellar
  await m.react('🕒')

  try {
    const apiURL = `https://api.stellarwa.xyz/buscar/googleimagen?consulta=${encodeURIComponent(text)}&apikey=${STELLAR_APIKEY}`
    const res = await axios.get(apiURL)

    // Adaptación al formato actual de la API
    const results = res.data?.result || res.data?.data || []
    if (!Array.isArray(results) || results.length === 0) {
      await m.react('❌')
      return m.reply(`${e} No se encontraron imágenes para "${text}".`)
    }

    await m.react('✅')

    const limit = Math.min(results.length, 9)
    for (let i = 0; i < limit; i++) {
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
        console.error(`Error al enviar imagen ${i + 1}:`, err.message)
      }
    }
  } catch (error) {
    console.error('Error al obtener imágenes de Stellar:', error?.response?.data || error.message)
    m.reply('⚠️ Error al buscar imágenes, intenta más tarde.')
  }
}

handler.command = ['imagenes', 'images', 'imagen', 'image']
handler.group = true

export default handler

// 🌟 IA de Stellar para moderación
async function stellarAI(prompt) {
  try {
    const url = `https://api.stellarwa.xyz/ai/chatgpt?text=${encodeURIComponent(prompt)}&apikey=${STELLAR_APIKEY}`
    const res = await axios.get(url)
    return res.data?.result || res.data?.data || 'no'
  } catch (error) {
    console.error('Error en Stellar AI:', error?.response?.data || error.message)
    throw error
  }
}
