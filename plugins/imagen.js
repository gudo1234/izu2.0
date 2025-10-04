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
    // 🧠 Verificación con IA (moderación)
    const prompt = `Eres una IA encargada de moderar contenido. Analiza el siguiente texto: "${text}". 
Responde solo con "PERMITIDO" si es una búsqueda segura, o "PROHIBIDO" si contiene temas sexuales, violentos, NSFW, explícitos, gore o inadecuados.`

    const verify = await axios.get(`https://api.stellarwa.xyz/ai/chatgpt?text=${encodeURIComponent(prompt)}&apikey=${apiKey}`)
    const iaResult = (verify.data.data || verify.data.result || '').toUpperCase()

    if (iaResult.includes('PROHIBIDO')) {
      m.react('❌')
      return conn.sendMessage(m.chat, {
        text: `${e} No puedo realizar esa búsqueda porque contiene contenido inapropiado.`
      }, { quoted: m })
    }

    // 🖼️ Buscar 5 imágenes
    m.react('🕒')
    const url = `https://api.stellarwa.xyz/search/googleimagen?query=${encodeURIComponent(text)}&apikey=${apiKey}&count=5`
    const res = await fetch(url)

    if (!res.ok) throw new Error(`Error ${res.status} en la API de imágenes.`)

    // Convertimos la respuesta en array de URLs o buffers según lo que devuelva la API
    const result = await res.json().catch(() => null)

    let images = []
    if (result?.data && Array.isArray(result.data)) {
      // Si la API devuelve varias imágenes
      images = result.data.slice(0, 5)
    } else {
      // Si la API solo devuelve una imagen, descargamos la misma 5 veces
      images = Array(5).fill(`https://api.stellarwa.xyz/search/googleimagen?query=${encodeURIComponent(text)}&apikey=${apiKey}`)
    }

    if (!images.length) throw new Error('No se obtuvieron imágenes.')

    // ✅ Enviar primera imagen con caption
    const first = await fetch(images[0])
    const buffer1 = await first.buffer()

    const caption = `${e} *Resultado de:* ${text}\n> 🌎 *Fuente:* Google Imágenes (Stellar API)`
    await conn.sendFile(m.chat, buffer1, 'imagen1.jpg', caption, m, null, rcanal)

    // 📤 Enviar las siguientes 4 imágenes sin caption
    for (let i = 1; i < images.length; i++) {
      try {
        const imgRes = await fetch(images[i])
        const buffer = await imgRes.buffer()
        await conn.sendMessage(m.chat, { image: buffer }, { quoted: m })
      } catch (err) {
        console.error(`⚠️ Error al enviar imagen ${i + 1}:`, err)
      }
    }

    m.react('✅')

  } catch (err) {
    console.error('[❌ ERROR EN COMANDO IMAGEN + IA]', err)
    await conn.sendMessage(m.chat, {
      text: `${e} *Ocurrió un error al obtener la imagen:*\n\n📄 *Mensaje:* ${err.message}\n📍 *Línea:* ${err.stack?.split('\n')[1] || 'Desconocida'}`
    }, { quoted: m })
  }
}

handler.command = ['imagen', 'image', 'gimage', 'foto']
handler.group = true

export default handler
