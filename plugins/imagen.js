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

  if (!text) {
    return conn.reply(
      m.chat,
      `${e} Proporciona una búsqueda para enviar imágenes de la web.\n\n` +
      `*Ejemplo:* \`${usedPrefix + command} gatos\``,
      m
    )
  }

  await m.react('🕒')

  try {
    const url = `https://api.stellarwa.xyz/buscar/googleimagen?consulta=${encodeURIComponent(text)}&apikey=${STELLAR_APIKEY}`
    const res = await axios.get(url, { timeout: 20000 })

    console.log('🔍 Respuesta completa de Stellar:', res.data)

    const results = res.data?.result || res.data?.data || []
    if (!Array.isArray(results) || results.length === 0) {
      await m.react('❌')
      return m.reply(`${e} No se encontraron imágenes para "${text}".`)
    }

    await m.react('✅')
    const limit = Math.min(results.length, 5)

    for (let i = 0; i < limit; i++) {
      const imgUrl = results[i]
      const imgBuffer = await fetch(imgUrl).then(r => r.buffer())
      await conn.sendMessage(
        m.chat,
        {
          image: imgBuffer,
          caption: i === 0 ? `🖼️ Resultados de búsqueda para: *${text}*` : undefined,
        },
        { quoted: m }
      )
    }
  } catch (err) {
    console.error('❌ Error en la API Stellar:', err.response?.data || err.message)
    await m.react('❌')
    return m.reply(
      `${e} Error al buscar imágenes.\n\n` +
      `Detalles: ${err.response?.status || 'Sin código'} - ${err.response?.data?.message || err.message}`
    )
  }
}

handler.command = ['imagenes', 'images', 'imagen', 'image']
handler.group = true

export default handler
