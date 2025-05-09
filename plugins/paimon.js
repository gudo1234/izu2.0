import { youtubedl, youtubedlv2 } from '@bochilteam/scraper'
import fetch from 'node-fetch'
import yts from 'yt-search'
import { createRequire } from 'module'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

const require = createRequire(import.meta.url)
const { ytmp3, ytmp4 } = require("@hiudyy/ytdl")

let tempStorage = {}

const handler = async (m, { conn, command, args, text, usedPrefix }) => {
  try {
    if (!text) return conn.reply(m.chat, `❀ Por favor, ingresa el nombre o url de la música a descargar.`, m)

    const query = args.join(' ')
    const videoId = extractVideoId(query)

    await m.react('🕓')

    let video = null
    try {
      if (videoId) {
        const result = await yts({ videoId })
        video = result
      } else {
        const search = await yts(query)
        video = search.videos[0]
        if (!video) return m.reply('❌ No se pudo encontrar el video.')
      }
    } catch (e) {
      console.error('Error línea ~32:', e)
      return m.reply(`❗ Error en búsqueda de YouTube: ${e.message}`)
    }

    if (!video?.url) return m.reply('❌ No se pudo encontrar el video.')

    const caption = `「✦」Descargando *<${video.title || 'Desconocido'}>*\n> ✦ Descripción » *${video.description || 'Desconocido'}*\n> ✰ Vistas » *${formatViews(video.views) || 'Desconocido'}*\n> ⴵ Duración » *${video.timestamp || 'Desconocido'}*\n> ✐ Publicación » *${video.ago || 'Desconocido'}*\n> ✦ Url » *${video.url}*\n
*_Para seleccionar, responde a este mensaje:_*
> "a" o "audio" → *Audio*
> "v" o "video" → *Video*
> "adoc" → *Audio (doc)*
> "vdoc" → *Video (doc)*
`.trim()

    tempStorage[m.sender] = { url: video.url, title: video.title, resp: m, usedPrefix, command }

    let thumb
    try {
      thumb = (await conn.getFile(video.thumbnail))?.data
    } catch (e) {
      console.error('Error línea ~54 al obtener thumbnail:', e)
    }

    const JT = {
      contextInfo: {
        externalAdReply: {
          title: '✧ Youtube • Music ✧',
          body: textbot,
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
    console.error('Error general línea ~74:', err)
    m.reply(`Error inesperado en línea ~74:\n${err.message}`)
  }
}

handler.before = async (m, { conn }) => {
  if (!m.quoted || !m.quoted.sender) return 
  if (conn.user.jid !== m.quoted.sender) return

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
    console.error('Error en handler.before línea ~112:', err)
    m.reply(`Error al procesar la descarga en línea ~112: ${err.message}`)
  }
}

handler.command = handler.help = ['audio', 'video']
handler.group = true
export default handler

function extractVideoId(url = '') {
  try {
    const cleanUrl = new URL(url.trim())
    if (cleanUrl.hostname.includes('youtu.be')) {
      return cleanUrl.pathname.replace('/', '').substring(0, 11)
    }
    if (cleanUrl.hostname.includes('youtube.com')) {
      const v = cleanUrl.searchParams.get('v')
      if (v) return v.substring(0, 11)
      const parts = cleanUrl.pathname.split('/')
      return parts.includes('shorts') || parts.includes('embed') ? parts.pop().substring(0, 11) : null
    }
  } catch {
    const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/|live\/))([a-zA-Z0-9_-]{11})/
    const match = url.match(regex)
    return match?.[1] || null
  }
  return null
}

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1e9) return `${(views / 1e9).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1e6) return `${(views / 1e6).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1e3) return `${(views / 1e3).toFixed(1)}k (${views.toLocaleString()})`
  return views.toString()
                           }
