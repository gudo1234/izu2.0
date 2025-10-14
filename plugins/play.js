import yts from 'yt-search'
import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command, args }) => {
  const docAudio = ['play3', 'ytadoc', 'mp3doc', 'ytmp3doc']
  const docVideo = ['play4', 'ytvdoc', 'mp4doc', 'ytmp4doc']
  const normalAudio = ['play', 'yta', 'mp3', 'ytmp3']
  const normalVideo = ['play2', 'ytv', 'mp4', 'ytmp4']

  if (!text) {
    const tipo = normalAudio.includes(command)
      ? 'audio'
      : docAudio.includes(command)
      ? 'audio en documento'
      : normalVideo.includes(command)
      ? 'video'
      : 'video en documento'
    return m.reply(`${e} _Ingresa texto o enlace de YouTube para descargar el ${tipo}._\n\n📌 Ejemplo:\n*${usedPrefix + command}* diles\n*${usedPrefix + command}* https://youtu.be/UWV41yEiGq0`)
  }

  await m.react('🕒')

  try {
    const query = args.join(' ')
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const ytMatch = query.match(ytRegex)
    const search = ytMatch ? `https://youtube.com/watch?v=${ytMatch[1]}` : query

    const yt = await yts(search)
    const v = yt.videos[0]
    if (!v) return m.reply('❌ No se encontró el video.')

    const { title, thumbnail, timestamp, views, ago, url, author } = v
    const duration = timestamp || '0:00'

    const toSeconds = t => t.split(':').reduce((acc, n) => acc * 60 + +n, 0)
    const mins = toSeconds(duration) / 60
    const sendDoc = mins > 20 || docAudio.includes(command) || docVideo.includes(command)
    const isAudio = [...docAudio, ...normalAudio].includes(command)
    const type = isAudio ? (sendDoc ? 'audio (doc)' : 'audio') : (sendDoc ? 'video (doc)' : 'video')

    // ⚙️ Solo muestra el aviso si NO pidió documento y el video supera 20 min
    const aviso = !docAudio.includes(command) && !docVideo.includes(command) && mins > 20
      ? `\n${e} Se enviará como documento por superar 20 minutos.`
      : ''

    const caption = `
╭──── • ────╮
  🎧 *YOUTUBE EXTRACTOR*
╰──── • ────╯
🎵 *Título:* ${title}
📺 *Canal:* ${author?.name}
⏱️ *Duración:* ${duration}
👀 *Vistas:* ${views?.toLocaleString()}
📅 *Publicado:* ${ago}
🔗 *Link:* ${url}

> ⏳ Preparando ${type}...${aviso}
`.trim()

    await conn.sendFile(m.chat, thumbnail, 'thumb.jpg', caption, m, null, rcanal)

    // API principal y respaldo
    const main = `https://www.sankavollerei.com/download/ytmp4?apikey=planaai&url=${encodeURIComponent(url)}`
    const backup = `https://www.sankavollerei.com/download/ytmp3?apikey=planaai&url=${encodeURIComponent(url)}`
    let data, usedBackup = false

    try {
      const res = await axios.get(main)
      data = res.data.result
      if (!data?.download) throw new Error('Sin enlace principal')
    } catch {
      usedBackup = true
      const res = await axios.get(backup)
      data = res.data.result
    }

    if (!data?.download) return m.reply('❌ No se pudo obtener el enlace de descarga.')

    const fileName = `${data.title || title}.${isAudio ? 'mp3' : 'mp4'}`
    const mimetype = isAudio ? 'audio/mpeg' : 'video/mp4'

    await conn.sendMessage(m.chat, {
      [sendDoc ? 'document' : isAudio ? 'audio' : 'video']: { url: data.download },
      mimetype,
      fileName
      //caption: `✅ *${data.title || title}*\n⏱️ Duración: ${Math.floor(data.duration / 60)}:${(data.duration % 60).toString().padStart(2, '0')}`
    }, { quoted: m })

    await m.react(usedBackup ? '⌛' : '✅')
  } catch (err) {
    console.error(err)
    m.reply(`❌ Error: ${err.message}`)
  }
}

handler.command = [
  'play', 'yta', 'mp3', 'ytmp3',
  'play3', 'ytadoc', 'mp3doc', 'ytmp3doc',
  'play2', 'ytv', 'mp4', 'ytmp4',
  'play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'
]

handler.group = true
export default handler
