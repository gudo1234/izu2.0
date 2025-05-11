import yts from 'yt-search'
import fetch from 'node-fetch'

let tempStorage = {}

const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

const handler = async (m, { conn }) => {
  const match = m.text.match(ytRegex)
  if (!match) return

  const videoId = match[1]
  const search = await yts({ videoId })
  const video = search?.videos?.[0]
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

handler.before = async (m, { conn }) => {
  if (!m.quoted || !m.quoted.sender) return 
  if (conn.user.jid !== m.quoted.sender) return

  const text = m.text.trim().toLowerCase()
  if (!['a', 'audio', 'v', 'video', 'adoc', 'vdoc'].includes(text)) return
  const info = tempStorage[m.sender]
  if (!info || !info.url) return

  const sendMsg = async (type, url, fileName, mimetype) => {
    await conn.sendMessage(m.chat, {
      [type]: { url },
      fileName,
      mimetype
    }, { quoted: info.resp })
  }

  try {
    if (['a', 'audio', 'adoc'].includes(text)) {
      await conn.reply(m.chat, `*Enviando Audio...*`, info.resp)
      const res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${info.url}`)
      const json = await res.json()
      const download = json?.result?.download?.url
      if (!download) throw new Error('No se obtuvo URL de audio')
      await sendMsg(text === 'adoc' ? 'document' : 'audio', download, info.title + '.mp3', 'audio/mpeg')
    }

    if (['v', 'video', 'vdoc'].includes(text)) {
      await conn.reply(m.chat, `*Enviando Video...*`, info.resp)
      const res = await fetch(`https://api.neoxr.eu/api/youtube?url=${info.url}&type=video&quality=360p&apikey=GataDios`)
      const json = await res.json()
      const download = json?.data?.url
      if (!download) throw new Error('No se obtuvo URL de video')
      await sendMsg(text === 'vdoc' ? 'document' : 'video', download, info.title + '.mp4', 'video/mp4')
    }
  } catch (e) {
    console.error('Error al enviar:', e)
    m.reply(`❌ Error al procesar la descarga: ${e.message}`)
  }
}

handler.customPrefix = ytRegex
handler.command = new RegExp // para no usar comandos
handler.group = true
export default handler

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1e9) return `${(views / 1e9).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1e6) return `${(views / 1e6).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1e3) return `${(views / 1e3).toFixed(1)}k (${views.toLocaleString()})`
  return views.toString()
}
