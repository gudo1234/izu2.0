import yts from 'yt-search'
import fetch from 'node-fetch'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { ytmp3, ytmp4 } = require('@hiudyy/ytdl')

let tempStorage = {}

const handler = async (m, { conn }) => {
  // Regex para detectar URLs de YouTube
  const ytRegexGlobal = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g
  const matches = [...m.text.matchAll(ytRegexGlobal)]

  if (matches.length === 0) return // Si no hay coincidencias con YouTube, salimos

  for (const match of matches) {
    const videoId = match[1]
    const result = await yts({ videoId })
    if (!result || !result.title) continue // Si no se encuentra el video, continuamos

    // Generamos el mensaje con la info del video
    const caption = `「✦」Descargando *<${result.title}>*\n> ✦ Descripción » *${result.description || 'Desconocido'}*\n> ✰ Vistas » *${formatViews(result.views)}*\n> ⴵ Duración » *${result.timestamp || 'Desconocido'}*\n> ✐ Publicación » *${result.ago || 'Desconocido'}*\n> ✦ Url » *${result.url}*\n\n*_Para seleccionar, responde a este mensaje:_*\n> "a" o "audio" → *Audio*\n> "v" o "video" → *Video*\n> "adoc" → *Audio (doc)*\n> "vdoc" → *Video (doc)*`

    m.react('🕒')

    tempStorage[m.sender] = {
      url: result.url,
      title: result.title,
      resp: m,
    }

    let thumb
    try {
      thumb = (await conn.getFile(result.thumbnail))?.data
    } catch (e) {}

    const preview = {
      contextInfo: {
        externalAdReply: {
          title: '✧ Youtube • Music ✧',
          body: 'Selecciona el formato de descarga',
          mediaType: 1,
          previewType: 0,
          mediaUrl: result.url,
          sourceUrl: result.url,
          thumbnail: thumb,
          renderLargerThumbnail: true,
        },
      },
    }

    await conn.reply(m.chat, caption, m, preview)
  }
}

handler.before = async (m, { conn }) => {
  if (!m.quoted || !m.quoted.sender) return
  if (conn.user.jid !== m.quoted.sender) return

  const text = m.text.trim().toLowerCase()
  if (!['a', 'audio', 'v', 'video', 'adoc', 'vdoc'].includes(text)) return

  const data = tempStorage[m.sender]
  if (!data || !data.url) return

  try {
    const send = async (type, url, fileName, mimetype) => {
      await conn.sendMessage(m.chat, {
        [type]: { url },
        fileName,
        mimetype,
      }, { quoted: data.resp })
    }

    if (['a', 'audio', 'adoc'].includes(text)) {
      await conn.reply(m.chat, `*Enviando Audio...*`, data.resp)
      const res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${data.url}`)
      const json = await res.json()
      const dl = json?.result?.download?.url
      if (!dl) throw new Error('No se pudo obtener el audio')
      await send(text === 'adoc' ? 'document' : 'audio', dl, data.title + '.mp3', 'audio/mpeg')
    }

    if (['v', 'video', 'vdoc'].includes(text)) {
      await conn.reply(m.chat, `*Enviando Video...*`, data.resp)
      const res = await fetch(`https://api.neoxr.eu/api/youtube?url=${data.url}&type=video&quality=360p&apikey=GataDios`)
      const json = await res.json()
      const dl = json?.data?.url
      if (!dl) throw new Error('No se pudo obtener el video')
      await send(text === 'vdoc' ? 'document' : 'video', dl, data.title + '.mp4', 'video/mp4')
    }

  } catch (err) {
    console.error('Error en respuesta automática:', err)
    m.reply(`Error al procesar:\n${err.message}`)
  }
}

// Este handler se activa con cualquier mensaje que contenga un enlace de YouTube
handler.customPrefix = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|live\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}/i
handler.command = new RegExp // sin comandos
handler.group = true // solo en grupos, quita esto si lo quieres global
export default handler

// Función para formatear las vistas
function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1e9) return `${(views / 1e9).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1e6) return `${(views / 1e6).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1e3) return `${(views / 1e3).toFixed(1)}k (${views.toLocaleString()})`
  return views.toString()
}
