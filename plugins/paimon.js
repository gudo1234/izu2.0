import { youtubedl, youtubedlv2 } from '@bochilteam/scraper'
import fetch from 'node-fetch'
import yts from 'yt-search'
import ytdl from 'ytdl-core'
import axios from 'axios'
import { createRequire } from 'module'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

const require = createRequire(import.meta.url)
const { ytmp3, ytmp4 } = require("@hiudyy/ytdl")

let tempStorage = {}
const youtubeRegexID = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

const handler = async (m, {conn, command, args, text, usedPrefix}) => {
  try {
    if (!text) return conn.reply(m.chat, `❀ Por favor, ingresa el nombre o url de la música a descargar.`, m)

    let videoIdToFind = null
    try {
      const match = text.match(youtubeRegexID)
      if (match) videoIdToFind = match[1]
    } catch (e) {
      console.error('Error extrayendo videoId en línea ~24:', e)
    }

    await m.react('🕓')

    let ytplay2
    try {
      const searchResult = await search(args.join(' '))
      ytplay2 = await yts(videoIdToFind ? `https://youtu.be/${videoIdToFind}` : text)
    } catch (e) {
      console.error('Error haciendo búsqueda YTS en línea ~31:', e)
    }

    if (videoIdToFind) {
      const videoId = videoIdToFind
      ytplay2 = ytplay2.all?.find(item => item.videoId === videoId) || ytplay2.videos?.find(item => item.videoId === videoId)
    }

    ytplay2 = ytplay2?.all?.[0] || ytplay2?.videos?.[0] || ytplay2

    if (!ytplay2?.url) {
      return m.reply('❌ No se pudo encontrar el video.')
    }

    const caption = `「✦」Descargando *<${ytplay2.title || 'Desconocido'}>*\n> ✦ Descripción » *${ytplay2.description || 'Desconocido'}*\n> ✰ Vistas » *${formatViews(ytplay2.views) || 'Desconocido'}*\n> ⴵ Duración » *${ytplay2.timestamp || 'Desconocido'}*\n> ✐ Publicación » *${ytplay2.ago || 'Desconocido'}*\n> ✦ Url » *${ytplay2.url}*\n
*_Para seleccionar, responde a este mensaje:_*
> "a" o "audio" → *Audio*
> "v" o "video" → *Video*
> "adoc" → *Audio (doc)*
> "vdoc" → *Video (doc)*
`.trim()

    tempStorage[m.sender] = { url: ytplay2.url, title: ytplay2.title, resp: m, usedPrefix, command }

    let thumb
    try {
      thumb = (await conn.getFile(ytplay2.thumbnail))?.data
    } catch (e) {
      console.error('Error obteniendo thumbnail en línea ~54:', e)
    }

    const JT = {
      contextInfo: {
        externalAdReply: {
          title: '✧ Youtube • Music ✧',
          body: textbot,
          mediaType: 1,
          previewType: 0,
          mediaUrl: ytplay2.url,
          sourceUrl: ytplay2.url,
          thumbnail: thumb,
          renderLargerThumbnail: true,
        },
      },
    }

    await conn.reply(m.chat, caption, m, JT)

  } catch (err) {
    console.error('Error general en línea ~74:', err)
    m.reply(`❗ Error inesperado:\n${err.message}`)
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
    console.error('Error en handler.before en línea ~112:', err)
    m.reply(`❗ Error al procesar la descarga: ${err.message}`)
  }
}

handler.command = handler.help = ['pla', 'play2']
export default handler

async function search(query, options = {}) {
  return (await yts.search({ query, hl: 'es', gl: 'ES', ...options })).videos
}

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1e9) return `${(views / 1e9).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1e6) return `${(views / 1e6).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1e3) return `${(views / 1e3).toFixed(1)}k (${views.toLocaleString()})`
  return views.toString()
          }
