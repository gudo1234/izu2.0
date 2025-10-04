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

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    // Filtro de palabras prohibidas
    const prohibidas = /(porno|sex|puta|puto|polla|xxx|xnxx|xvideos|hentai|desnudo|desnuda|zoofilia|pedo|necrofilia|vagina|pene|porn|culo|ass|nude|rule34|sexo|ahegao|anal|futanari|blowjob|gore|mierda|mamada)/i
    if (!text) return conn.sendMessage(m.chat, { text: `📷 Ingresa el tema a buscar.\n\nEjemplo: *${usedPrefix + command} Gatos bonitos*` }, { quoted: m })
    if (prohibidas.test(text.toLowerCase())) return conn.sendMessage(m.chat, { text: '⚠️ No se permiten búsquedas con contenido inapropiado.' }, { quoted: m })

    // API de Stellar
    const url = `https://api.stellarwa.xyz/search/googleimagen?query=${encodeURIComponent(text)}&apikey=stellar-LgIsemtM`
    const res = await fetch(url)

    if (!res.ok) throw new Error(`Error ${res.status} en la API de Stellar.`)

    const buffer = await res.buffer()
    const caption = `🔎 *Resultado de:* ${text}\n🌎 *Fuente:* Google Images (Stellar API)`

    await conn.sendMessage(m.chat, { image: buffer, caption }, { quoted: m })
  } catch (e) {
    console.error('[❌ ERROR EN COMANDO IMAGEN STELLAR]', e)
    await conn.sendMessage(
      m.chat,
      {
        text: `⚠️ *Ocurrió un error al obtener la imagen:*\n\n📄 *Mensaje:* ${e.message}\n📍 *Línea:* ${e.stack?.split('\n')[1] || 'Desconocida'}`,
      },
      { quoted: m }
    )
  }
}

handler.command = ['imagen', 'image', 'gimage', 'foto']
handler.group = true

export default handler
