import axios from 'axios'
import fetch from 'node-fetch'
import { googleImage, youtubedl, youtubedlv2 } from '@bochilteam/scraper'
import yts from 'yt-search'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')
  const username = `${conn.getName(m.sender)}`
  const basePrompt = `Tu nombre es izuBot. Eres una inteligencia artificial profesional, confiable y útil, enfocada en ayudar con información precisa, búsqueda de contenido, generación de imágenes o música. Siempre respondes con claridad, empatía y sin exageraciones ni referencias absurdas. Lenguaje: Español claro, formal pero cercano.`

  // Análisis de imagen citada
  if (isQuotedImage) {
    const q = m.quoted
    const img = await q.download?.()
    if (!img) return conn.reply(m.chat, 'Error: No se pudo descargar la imagen.', m)
    const content = 'Describe el contenido de esta imagen.'
    try {
      const imageAnalysis = await fetchImageBuffer(content, img)
      const prompt = `${basePrompt}. La imagen que se analiza es: ${imageAnalysis.result}`
      const description = await luminsesi(content, username, prompt)
      await conn.reply(m.chat, description, m)
    } catch (error) {
      console.error('Error al analizar la imagen:', error)
      await conn.reply(m.chat, 'Error al analizar la imagen.', m)
    }
    return
  }

  if (!text) return conn.reply(m.chat, `Ingrese su petición.\nEjemplo: ${usedPrefix + command} ¿Qué es un bot?`, m)
  await m.react('💬')

  // Detección semántica con IA
  let intencion
  try {
    intencion = await detectarIntencion(text, username)
  } catch (e) {
    console.error('Error detectando intención:', e)
    intencion = 'otro'
  }

  // Petición de música
  if (intencion === 'musica') {
    try {
      await m.react('🎵')
      const query = text
      const ytMatch = query.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
      let video
      if (ytMatch) {
        const videoId = ytMatch[1]
        const ytres = await yts({ videoId })
        video = ytres
      } else {
        const ytres = await yts(query)
        video = ytres.videos[0]
        if (!video) return m.reply('No se encontró la canción.')
      }

      const { title, timestamp, url } = video
      let yt = await youtubedl(url).catch(() => youtubedlv2(url))
      let audio = yt.audio?.['128kbps']
      if (!audio) return m.reply('No se encontró el audio compatible.')
      const { fileSizeH: sizeText, fileSize } = audio
      const sizeMB = fileSize / (1024 * 1024)

      let durationMin = 0
      if (timestamp) {
        const parts = timestamp.split(':').map(Number)
        if (parts.length === 3) durationMin = parts[0] * 60 + parts[1] + parts[2] / 60
        else if (parts.length === 2) durationMin = parts[0] + parts[1] / 60
        else if (parts.length === 1) durationMin = parts[0]
      }

      let downloadUrl
      try {
        const api1 = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${url}`)
        if (api1.data?.data?.dl) downloadUrl = api1.data.data.dl
        else throw new Error()
      } catch {
        try {
          const api2 = await axios.get(`https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`)
          if (api2.data?.result?.download?.url) downloadUrl = api2.data.result.download.url
        } catch {
          return m.reply('Error al obtener el enlace de descarga.')
        }
      }

      if (!downloadUrl) return m.reply('No se pudo procesar la descarga.')

      const sendAsDocument = sizeMB >= 100 || durationMin >= 15
      const payload = {
        [sendAsDocument ? 'document' : 'audio']: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }

      await conn.sendMessage(m.chat, payload, { quoted: m })
      await m.react('✅')
    } catch (err) {
      console.error(err)
      return m.reply('Error al procesar la música.')
    }
    return
  }

  // Petición de imagen
  if (intencion === 'imagen') {
    await m.react('🖼️')
    try {
      const res = await googleImage(text)
      const img = res.getRandom()
      await conn.sendFile(m.chat, img, 'imagen.jpg', `Aquí tienes la imagen para: ${text}`, m)
      await m.react('✅')
    } catch (e) {
      console.error(e)
      return m.reply('No se pudo obtener una imagen.')
    }
    return
  }

  // Respuesta normal
  try {
    const prompt = `${basePrompt}. Responde lo siguiente: ${text}`
    const response = await luminsesi(text, username, prompt)
    await conn.reply(m.chat, response, m)
  } catch (error) {
    console.error('Error IA:', error)
    await conn.reply(m.chat, 'Ocurrió un error. Intenta nuevamente más tarde.', m)
  }
}

handler.command = ['bot', 'meta']
handler.group = true

export default handler

// --- funciones auxiliares ---

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
    console.error('Error al analizar imagen:', error)
    throw error
  }
}

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
    console.error('Error Luminai:', error)
    throw error
  }
}

// Nueva función para detección de intención
async function detectarIntencion(text, username) {
  const prompt = `
Eres una IA que clasifica peticiones. Dada la siguiente entrada, responde solo una palabra indicando la intención:
- "musica" si es una petición de canción, música, audio o similar.
- "imagen" si es una petición de imagen, ilustración o contenido visual.
- "otro" si no corresponde a ninguna de las anteriores.

Petición: "${text}"
Respuesta:`.trim()
  const result = await luminsesi(text, username, prompt)
  return result.toLowerCase()
}
