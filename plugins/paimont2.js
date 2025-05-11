import { youtubedl } from '@bochilteam/scraper'
import fetch from 'node-fetch'
import yts from 'yt-search'

let tempStorage = {}

const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

const handler = async (m, { conn }) => {
  const url = m.text?.trim()
  if (!ytRegex.test(url)) return // Ignorar si no es una URL válida de YouTube

  const videoId = url.match(ytRegex)?.[1]
  if (!videoId) return

  try {
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

    tempStorage[m.sender] = { url: video.url, title: video.title, resp: m }

    const thumb = (await conn.getFile(video.thumbnail))?.data
    const JT = {
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

    await conn.reply(m.chat, caption, m, JT)
  } catch (err) {
    console.error('Error en autodetector:', err)
  }
}

handler.customPrefix = ytRegex
handler.command = new RegExp('') // para que no necesite comando
handler.group = true
export default handler

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1e9) return `${(views / 1e9).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1e6) return `${(views / 1e6).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1e3) return `${(views / 1e3).toFixed(1)}k (${views.toLocaleString()})`
  return views.toString()
                              }
