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
      m.react('❌')
      return conn.sendMessage(m.chat, {
        text: `${e} No puedo realizar esa búsqueda porque contiene contenido inapropiado.`
      }, { quoted: m })
    }
    m.react('🕒')
    const url = `https://api.stellarwa.xyz/search/googleimagen?query=${encodeURIComponent(text)}&apikey=${apiKey}`
    const res = await fetch(url)

    if (!res.ok) throw new Error(`Error ${res.status} en la API de imágenes.`)

    const buffer = await res.buffer()
    const caption = `${e} *Resultado de:* ${text}\n> 🌎 *Fuente:* Google Imagenes`
m.react('✅')
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
