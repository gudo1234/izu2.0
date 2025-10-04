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

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const username = `${conn.getName(m.sender)}`
  const apiKey = 'stellar-LgIsemtM'

  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `📷 Hola *${username}*, dime qué imagen quieres buscar.\n\nEjemplo: *${usedPrefix + command} paisaje nocturno*`
    }, { quoted: m })
  }

  try {
    // 🧠 Verificación con IA antes de buscar la imagen
    const prompt = `Eres una IA encargada de moderar contenido. Analiza el siguiente texto: "${text}". 
    Responde solo con "PERMITIDO" si es una búsqueda segura, o "PROHIBIDO" si contiene temas sexuales, violentos, NSFW, explícitos, gore o inadecuados.`

    const verify = await axios.get(`https://api.stellarwa.xyz/ai/chatgpt?text=${encodeURIComponent(prompt)}&apikey=${apiKey}`)
    const iaResult = (verify.data.data || verify.data.result || '').toUpperCase()

    if (iaResult.includes('PROHIBIDO')) {
      return conn.sendMessage(m.chat, {
        text: `${e} *${username}*, no puedo realizar esa búsqueda porque contiene contenido inapropiado.`
      }, { quoted: m })
    }

    // 🔍 Si la IA da permiso, buscamos la imagen
    const url = `https://api.stellarwa.xyz/search/googleimagen?query=${encodeURIComponent(text)}&apikey=${apiKey}`
    const res = await fetch(url)

    if (!res.ok) throw new Error(`Error ${res.status} en la API de imágenes.`)

    const buffer = await res.buffer()
    const caption = `${e} *Resultado de:* ${text}\n> 🌎 *Fuente:* Google Imagenes`

    //await conn.sendMessage(m.chat, { image: buffer, caption }, { quoted: m })
await conn.sendFile(m.chat, buffer, "Thumbnail.jpg", caption, m, null, rcanal)
  } catch (e) {
    console.error('[❌ ERROR EN COMANDO IMAGEN + IA]', e)
    await conn.sendMessage(m.chat, {
      text: `${e} *Ocurrió un error al obtener la imagen:*\n\n📄 *Mensaje:* ${e.message}\n📍 *Línea:* ${e.stack?.split('\n')[1] || 'Desconocida'}`
    }, { quoted: m })
  }
}

handler.command = ['imagen', 'image', 'gimage', 'foto']
handler.group = true

export default handler
