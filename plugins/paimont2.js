import yts from 'yt-search'
import fetch from 'node-fetch'

let tempStorage = {}

const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

const handler = {
  before: async (m, { conn }) => {
    const text = m.text?.trim()
    if (!text || !ytRegex.test(text)) return

    // Evitar activar si hay más texto (solo queremos mensajes con URL pura)
    const match = text.match(ytRegex)
    if (!match || text !== match[0]) return

    const videoId = match[1]
    const { videos } = await yts({ videoId })
    const video = videos?.[0]
    if (!video) return

    const caption = `「✦」Descargando *<${video.title || 'Desconocido'}>*\n> ✦ Descripción » *${video.description || 'Desconocido'}*\n> ✰ Vistas » *${formatViews(video.views) || 'Desconocido'}*\n> ⴵ Duración » *${video.timestamp || 'Desconocido'}*\n> ✐ Publicación » *${video.ago || 'Desconocido'}*\n> ✦ Url » *${video.url}*\n
*_Para seleccionar, responde a este mensaje:_*
> "a" o "audio" → *Audio*
> "v" o "video" → *Video*
> "adoc" → *Audio (doc)*
> "vdoc" → *Video (doc)*
`.trim()

    tempStorage[m.sender] = {
      url: video.url,
      title: video.title,
      resp: m
    }

    const thumb = (await conn.getFile(video.thumbnail))?.data
    const infoMsg = {
      contextInfo: {
        externalAdReply: {
          title: '✧ Youtube • Music ✧',
          body: 'Selecciona el formato de descarga',
          mediaType: 1,
          previewType: 0,
          mediaUrl: video.url,
          sourceUrl: video.url,
          thumbnail: thumb,
          renderLargerThumbnail: true,
        },
      },
    }

    await conn.reply(m.chat, caption, m, infoMsg)
  }
}

export default handler

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1e9) return `${(views / 1e9).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1e6) return `${(views / 1e6).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1e3) return `${(views / 1e3).toFixed(1)}k (${views.toLocaleString()})`
  return views.toString()
}
