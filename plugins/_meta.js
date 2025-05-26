import axios from 'axios'
import fetch from 'node-fetch'
import { googleImage } from '@bochilteam/scraper'
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper'
import yts from 'yt-search'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')
  const username = `${conn.getName(m.sender)}`
  const basePrompt = `Tu nombre es izuBot (IA creada por ${author}). Te comportas como una inteligencia artificial profesional, amigable y servicial. Eres clara, directa y útil. Te expresas con respeto y precisión. No usas bromas ni exageraciones, y siempre estás orientada a resolver la necesidad del usuario de forma efectiva.`

  if (isQuotedImage) {
    const q = m.quoted
    const img = await q.download?.()
    if (!img) return conn.reply(m.chat, 'Error: No se pudo descargar la imagen.', m)
    const content = 'Describe detalladamente el contenido de esta imagen.'
    try {
      const imageAnalysis = await fetchImageBuffer(content, img)
      const query = 'Describe la imagen y explica qué se observa y cómo actúan las personas o elementos.'
      const prompt = `${basePrompt}. La imagen a analizar es: ${imageAnalysis.result}`
      const description = await luminsesi(query, username, prompt)
      await conn.reply(m.chat, description, m)
    } catch (error) {
      console.error('Error al analizar la imagen:', error)
      await conn.reply(m.chat, 'Error al analizar la imagen.', m)
    }
  } else {
    if (!text) return conn.reply(m.chat, `*Ingrese su petición*\nEjemplo de uso: ${usedPrefix + command} ¿Qué es un bot?`, m)
    await m.react('💬')

    // Si el texto contiene una solicitud de imagen
    if (/imagen|dibuja|genera una imagen|muestra una foto/i.test(text)) {
      try {
        const res = await googleImage(text)
        const image = res.getRandom()
        await conn.sendFile(m.chat, image, 'imagen.jpg', `Aquí tienes la imagen solicitada: "${text}"`, m)
      } catch (e) {
        console.error(e)
        await conn.reply(m.chat, 'No se pudo obtener una imagen.', m)
      }
      return
    }

    // Si el texto contiene una solicitud musical
    if (/música|audio|canción|reproduce/i.test(text)) {
      try {
        const search = await yts(text)
        const vid = search.videos[0]
        const url = vid.url
        const api1 = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${url}`)
        const title = vid.title
        const audio = api1?.data?.result?.audio

        if (!audio?.url) throw 'No se pudo obtener el audio'

        await conn.sendMessage(m.chat, {
          document: { url: audio.url },
          fileName: title + '.mp3',
          mimetype: 'audio/mpeg'
        }, { quoted: m })
      } catch (e) {
        console.error(e)
        await conn.reply(m.chat, 'No se pudo enviar la música solicitada.', m)
      }
      return
    }

    // Caso general de pregunta a la IA
    try {
      const query = text
      const prompt = `${basePrompt}. Responde lo siguiente: ${query}`
      const response = await luminsesi(query, username, prompt)
      await conn.reply(m.chat, response, m)
    } catch (error) {
      console.error('Error al obtener la respuesta:', error)
      await conn.reply(m.chat, 'Error: intenta más tarde.', m)
    }
  }
}

handler.command = ['meta']
handler.group = true

export default handler

// Análisis de imagen
async function fetchImageBuffer(content, imageBuffer) {
  try {
    const response = await axios.post('https://Luminai.my.id', {
      content,
      imageBuffer
    }, {
      headers: { 'Content-Type': 'application/json' }
    })
    return response.data
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// Lógica de IA
async function luminsesi(q, username, logic) {
  try {
    const response = await axios.post("https://Luminai.my.id", {
      content: q,
      user: username,
      prompt: logic,
      webSearchMode: false
    })
    return response.data.result
  } catch (error) {
    console.error('Error al obtener:', error)
    throw error
  }
          }
