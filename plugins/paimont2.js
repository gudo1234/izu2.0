import fetch from 'node-fetch'
import yts from 'yt-search'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { ytmp3, ytmp4 } = require("@hiudyy/ytdl")

let tempStorage = {}

const handler = async (m, { conn }) => { } // vacía, ya no usaremos handler.command

handler.before = async (m, { conn }) => {
  const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g

  // Detectar URLs de YouTube sin comando
  const matches = [...m.text.matchAll(ytRegex)]
  if (matches.length > 0 && !m.quoted) {
    for (const match of matches) {
      const videoId = match[1]
      const result = await yts({ videoId })
      if (!result || !result.title) continue
      await enviarRespuesta(result, m, conn)
    }
    return
  }

  // Detectar respuesta de usuario (a, v, adoc, vdoc)
  if (!m.quoted || !m.quoted.sender || conn.user.jid !== m.quoted.sender) return
  const text = m.text.trim().toLowerCase()
  if (!['a', 'audio', 'v', 'video', 'adoc', 'vdoc'].includes(text)) return
  const gata = tempStorage[m.sender]
  if (!gata || !gata.url) return

  try {
    const sendMsg = async (type, url, fileName, mimetype) => {
      await conn.sendMessage(m.chat, {
        [type]: { url },
        fileName,
        mimetype
      }, { quoted: gata.resp })
    }

    if (['a', 'audio', 'adoc'].includes(text)) {
      await conn.reply(m.chat, `*Enviando Audio...*`, gata.resp)
      const res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${gata.url}`)
      const api = await res.json()
      const download = api?.result?.download?.url
      if (!download) throw new Error('No se obtuvo URL de audio')
      await sendMsg(text === 'adoc' ? 'document' : 'audio', download, gata.title + '.mp3', 'audio/mpeg')
    }

    if (['v', 'video', 'vdoc'].includes(text)) {
      await conn.reply(m.chat, `*Enviando Video...*`, gata.resp)
      const res = await fetch(`https://api.neoxr.eu/api/youtube?url=${gata.url}&type=video&quality=360p&apikey=GataDios`)
      const api = await res.json()
      const download = api?.data?.url
      if (!download) throw new Error('No se obtuvo URL de video')
      await sendMsg(text === 'vdoc' ? 'document' : 'video', download, gata.title + '.mp4', 'video/mp4')
    }

  } catch (err) {
    console.error('Error en handler.before descarga:', err)
    m.reply(`Error al procesar la descarga:\n${err.message}`)
  }
}

async function enviarRespuesta(video, m, conn) {
  const caption = `「✦」Descargando *<${video.title || 'Desconocido'}>*\n> ✦ Descripción » *${video.description || 'Desconocido'}*\n> ✰ Vistas » *${formatViews(video.views) || 'Desconocido'}*\n> ⴵ Duración » *${video.timestamp || 'Desconocido'}*\n> ✐ Publicación » *${video.ago || 'Desconocido'}*\n> ✦ Url » *${video.url}*\n
*_Para seleccionar, responde a este mensaje:_*
> "a" o "audio" → *Audio*
> "v" o "video" → *Video*
> "adoc" → *Audio (doc)*
> "vdoc" → *Video (doc)*
`.trim()

  tempStorage[m.sender] = { url: video.url, title: video.title, resp: m }

  let thumb
  try {
    thumb = (await conn.getFile(video.thumbnail))?.data
  } catch (e) {
    console.error('Error al obtener thumbnail:', e)
  }

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
}

handler.command = [] // No tiene comandos
handler.group = true
export default handler

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1e9) return `${(views / 1e9).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1e6) return `${(views / 1e6).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1e3) return `${(views / 1e3).toFixed(1)}k (${views.toLocaleString()})`
  return views.toString()
  }
